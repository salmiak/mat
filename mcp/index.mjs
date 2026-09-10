#!/usr/bin/env node
// MCP server for Beckmans Matplanering. Talks to the site's REST API so
// Claude can read recipes and create/edit the week's meals.
//
// Env:
//   MAT_API_URL   e.g. https://mat.example.com (no trailing slash)
//   MAT_API_TOKEN one of the server's API_TOKENS
import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const BASE = (process.env.MAT_API_URL ?? '').replace(/\/$/, '')
const TOKEN = process.env.MAT_API_TOKEN ?? ''

if (!BASE || !TOKEN) {
  console.error('Set MAT_API_URL and MAT_API_TOKEN')
  process.exit(1)
}

async function api (method, path, body) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    throw new Error(`${method} ${path} failed: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

function json (data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
}

const IMAGE_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.heic': 'image/heic'
}

// Uploads a local image file and returns its /api/images/<id> URL
async function uploadImage (imagePath) {
  const contentType = IMAGE_TYPES[extname(imagePath).toLowerCase()]
  if (!contentType) {
    throw new Error(`Unsupported image type: ${imagePath} (use ${Object.keys(IMAGE_TYPES).join(', ')})`)
  }
  const data = await readFile(imagePath)
  const filename = encodeURIComponent(imagePath.split('/').pop())
  const res = await fetch(`${BASE}/api/images?filename=${filename}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': contentType },
    body: data
  })
  if (!res.ok) {
    throw new Error(`Image upload failed: ${res.status} ${await res.text()}`)
  }
  return (await res.json()).url
}

const server = new McpServer({ name: 'mat', version: '1.0.0' })

server.registerTool('list_recipes', {
  title: 'List recipes',
  description: 'All saved recipes: id, title, comment (markdown, often ingredients/instructions), url, and score (sum of thumb votes on meals using the recipe — higher means the family liked it). Use the ids in create_meal/update_meal to link recipes to a meal.'
}, async () => {
  const { recipes } = await api('GET', '/recipes')
  return json(recipes.map(({ id, title, comment, url, score }) => ({ id, title, comment, url, score })))
})

const weekArgs = {
  week: z.number().int().min(1).max(53).describe('ISO week number'),
  year: z.number().int().describe('ISO week-numbering year, e.g. 2026')
}

server.registerTool('get_week', {
  title: 'Get a week\'s meal plan',
  description: 'The planned meals for an ISO week: id, title, comment, date (YYYY-MM-DD), made (already cooked), recipeIds, and vote tallies.',
  inputSchema: weekArgs
}, async ({ week, year }) => {
  const { meals } = await api('GET', `/meals?week=${week}&year=${year}`)
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
  const { meal } = await api('POST', '/meals', {
    title,
    date,
    comment: comment ?? '',
    recipeIds: recipeIds ?? []
  })
  return json(meal)
})

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
  const { meals } = await api('GET', '/meals')
  const current = meals.find((m) => m.id === id)
  if (!current) throw new Error(`Meal ${id} not found`)
  const { meal } = await api('PUT', `/meals/${id}`, {
    title: changes.title ?? current.title,
    date: changes.date ?? current.date,
    comment: changes.comment ?? current.comment,
    index: current.index,
    made: changes.made ?? current.made,
    recipeIds: changes.recipeIds ?? current.recipeIds
  })
  return json(meal)
})

const recipeCommentDescription = 'The recipe itself as markdown: a short intro if useful, then "### Ingredienser" as a bulleted list and "### Gör så här" as a numbered list. Write in Swedish. For link-only recipes this can be a one-line description instead.'

server.registerTool('create_recipe', {
  title: 'Create a recipe',
  description: 'Save a recipe. Either link an external recipe (url + a short comment), or write a full recipe in the comment field. imagePath uploads a local image file and attaches it.',
  inputSchema: {
    title: z.string().describe('Recipe title, e.g. "Pasta carbonara"'),
    url: z.string().url().optional().describe('Link to an external recipe page'),
    comment: z.string().optional().describe(recipeCommentDescription),
    imagePath: z.string().optional().describe('Absolute path to a local image file to upload and attach')
  }
}, async ({ title, url, comment, imagePath }) => {
  const imageUrl = imagePath ? await uploadImage(imagePath) : null
  const { recipe } = await api('POST', '/recipes', {
    title,
    url: url ?? '',
    comment: comment ?? '',
    imageUrl
  })
  return json(recipe)
})

server.registerTool('update_recipe', {
  title: 'Update a recipe',
  description: 'Change a recipe\'s title, url or comment, or attach an image via imagePath. Omitted fields keep their current value.',
  inputSchema: {
    id: z.number().int(),
    title: z.string().optional(),
    url: z.string().optional(),
    comment: z.string().optional().describe(recipeCommentDescription),
    imagePath: z.string().optional().describe('Absolute path to a local image file to upload and attach (replaces any current image)')
  }
}, async ({ id, imagePath, ...changes }) => {
  const { recipes } = await api('GET', '/recipes')
  const current = recipes.find((r) => r.id === id)
  if (!current) throw new Error(`Recipe ${id} not found`)
  const imageUrl = imagePath ? await uploadImage(imagePath) : current.imageUrl
  const { recipe } = await api('PUT', `/recipes/${id}`, {
    title: changes.title ?? current.title,
    url: changes.url ?? current.url,
    comment: changes.comment ?? current.comment,
    imageUrl
  })
  return json(recipe)
})

server.registerTool('delete_meal', {
  title: 'Delete a meal',
  description: 'Remove a planned meal by id.',
  inputSchema: { id: z.number().int() }
}, async ({ id }) => {
  await api('DELETE', `/meals/${id}`)
  return json({ deleted: id })
})

await server.connect(new StdioServerTransport())
