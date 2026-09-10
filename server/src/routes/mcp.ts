import { Router, type Request, type Response } from 'express'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'

// Remote MCP endpoint (streamable HTTP, stateless) so Claude on mobile and
// claude.ai can plan meals. Added as a custom connector with the token in
// the URL: https://<domain>/mcp/<token> — claude.ai cannot send custom
// auth headers, so the URL itself is the secret. Tokens rotate via the
// API_TOKENS env var.
//
// The tools call this server's own REST API (self-fetch with the same
// token), so auth, validation, serialization and live-update events all
// behave exactly as for the web client and the stdio MCP in mcp/.

export interface McpOptions {
  /** Valid tokens; null means auth is disabled (local dev) and any path token is accepted. */
  apiTokens: string[] | null
  /** Base URL of this server's own API, e.g. http://127.0.0.1:8081 */
  selfBaseUrl: string
}

function buildServer (options: McpOptions, token: string): McpServer {
  async function api<T = never> (method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${options.selfBaseUrl}/api${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
    if (!res.ok) {
      throw new Error(`${method} ${path} failed: ${res.status} ${await res.text()}`)
    }
    return res.json() as Promise<T>
  }

  function json (data: unknown) {
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
  }

  const server = new McpServer({ name: 'mat', version: '2.0.0' })

  server.registerTool('list_recipes', {
    title: 'List recipes',
    description: 'All saved recipes: id, title, comment (markdown, often ingredients/instructions), url, and score (sum of thumb votes on meals using the recipe — higher means the family liked it). Use the ids in create_meal/update_meal to link recipes to a meal.'
  }, async () => {
    const { recipes } = await api<{ recipes: Array<Record<string, unknown>> }>('GET', '/recipes')
    return json(recipes.map(({ id, title, comment, url, score }) => ({ id, title, comment, url, score })))
  })

  server.registerTool('get_week', {
    title: 'Get a week\'s meal plan',
    description: 'The planned meals for an ISO week: id, title, comment, date (YYYY-MM-DD), made (already cooked), recipeIds, and vote tallies.',
    inputSchema: {
      week: z.number().int().min(1).max(53).describe('ISO week number'),
      year: z.number().int().describe('ISO week-numbering year, e.g. 2026')
    }
  }, async ({ week, year }) => {
    const { meals } = await api<{ meals: unknown[] }>('GET', `/meals?week=${week}&year=${year}`)
    return json(meals)
  })

  server.registerTool('create_meal', {
    title: 'Create a meal',
    description: 'Plan a meal on a date. Link existing recipes via recipeIds (find ids with list_recipes).',
    inputSchema: {
      title: z.string().describe('Meal title, e.g. "Tacos"'),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('YYYY-MM-DD'),
      comment: z.string().optional().describe('Optional note (markdown)'),
      recipeIds: z.array(z.number().int()).optional().describe('Recipe ids to attach')
    }
  }, async ({ title, date, comment, recipeIds }) => {
    const { meal } = await api<{ meal: unknown }>('POST', '/meals', {
      title,
      date,
      comment: comment ?? '',
      recipeIds: recipeIds ?? []
    })
    return json(meal)
  })

  interface MealDto {
    id: number
    title: string
    comment: string
    date: string
    index: number
    made: boolean
    recipeIds: number[]
  }

  server.registerTool('update_meal', {
    title: 'Update a meal',
    description: 'Rewrite a meal (title, date, comment, made, recipeIds). Omitted fields keep their current value.',
    inputSchema: {
      id: z.number().int(),
      title: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      comment: z.string().optional(),
      made: z.boolean().optional().describe('true when the meal has been cooked'),
      recipeIds: z.array(z.number().int()).optional()
    }
  }, async ({ id, ...changes }) => {
    // The REST API replaces the whole meal, so merge onto the current one
    const { meals } = await api<{ meals: MealDto[] }>('GET', '/meals')
    const current = meals.find((m) => m.id === id)
    if (!current) throw new Error(`Meal ${id} not found`)
    const { meal } = await api<{ meal: unknown }>('PUT', `/meals/${id}`, {
      title: changes.title ?? current.title,
      date: changes.date ?? current.date,
      comment: changes.comment ?? current.comment,
      index: current.index,
      made: changes.made ?? current.made,
      recipeIds: changes.recipeIds ?? current.recipeIds
    })
    return json(meal)
  })

  server.registerTool('delete_meal', {
    title: 'Delete a meal',
    description: 'Remove a planned meal by id.',
    inputSchema: { id: z.number().int() }
  }, async ({ id }) => {
    await api('DELETE', `/meals/${id}`)
    return json({ deleted: id })
  })

  const recipeCommentDescription = 'The recipe itself as markdown: a short intro if useful, then "### Ingredienser" as a bulleted list and "### Gör så här" as a numbered list. Write in Swedish. For link-only recipes this can be a one-line description instead.'
  const authoredTitleNote = 'When the recipe text is authored by Claude (a full recipe written in the comment field, not a link to someone else\'s recipe), end the title with " 🤖" so the family can see it is Claude\'s own recipe.'

  server.registerTool('create_recipe', {
    title: 'Create a recipe',
    description: 'Save a recipe. Either link an external recipe (url + a short comment), or write a full recipe in the comment field — e.g. one read from a photo the user shared. (Attaching images is only possible from the local MCP or the web UI.)',
    inputSchema: {
      title: z.string().describe(`Recipe title, e.g. "Pasta carbonara". ${authoredTitleNote}`),
      url: z.string().url().optional().describe('Link to an external recipe page'),
      comment: z.string().optional().describe(recipeCommentDescription)
    }
  }, async ({ title, url, comment }) => {
    const { recipe } = await api<{ recipe: unknown }>('POST', '/recipes', {
      title,
      url: url ?? '',
      comment: comment ?? ''
    })
    return json(recipe)
  })

  interface RecipeDto {
    id: number
    title: string
    url: string
    comment: string
    imageUrl: string | null
  }

  server.registerTool('update_recipe', {
    title: 'Update a recipe',
    description: 'Change a recipe\'s title, url or comment. Omitted fields keep their current value; any image stays attached.',
    inputSchema: {
      id: z.number().int(),
      title: z.string().optional().describe(authoredTitleNote),
      url: z.string().optional(),
      comment: z.string().optional().describe(recipeCommentDescription)
    }
  }, async ({ id, ...changes }) => {
    const { recipes } = await api<{ recipes: RecipeDto[] }>('GET', '/recipes')
    const current = recipes.find((r) => r.id === id)
    if (!current) throw new Error(`Recipe ${id} not found`)
    const { recipe } = await api<{ recipe: unknown }>('PUT', `/recipes/${id}`, {
      title: changes.title ?? current.title,
      url: changes.url ?? current.url,
      comment: changes.comment ?? current.comment,
      imageUrl: current.imageUrl
    })
    return json(recipe)
  })

  return server
}

export function mcpRouter (options: McpOptions): Router {
  const router = Router({ mergeParams: true })

  router.post('/', async (req: Request<{ token: string }>, res: Response) => {
    const token = req.params.token
    if (options.apiTokens !== null && !options.apiTokens.includes(token)) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }
    // Stateless: a fresh server + transport per request, no session ids
    const server = buildServer(options, token)
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    res.on('close', () => {
      transport.close()
      server.close()
    })
    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
  })

  // Stateless transport: no SSE stream to resume, no session to delete
  const methodNotAllowed = (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed' },
      id: null
    })
  }
  router.get('/', methodNotAllowed)
  router.delete('/', methodNotAllowed)

  return router
}
