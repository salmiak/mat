#!/usr/bin/env node
// MCP server for Beckmans Matplanering. Talks to the site's REST API so
// Claude can read recipes and create/edit the week's meals.
//
// Env:
//   MAT_API_URL   e.g. https://mat.example.com (no trailing slash)
//   MAT_API_TOKEN one of the server's API_TOKENS
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

server.registerTool('delete_meal', {
  title: 'Delete a meal',
  description: 'Remove a planned meal by id.',
  inputSchema: { id: z.number().int() }
}, async ({ id }) => {
  await api('DELETE', `/meals/${id}`)
  return json({ deleted: id })
})

await server.connect(new StdioServerTransport())
