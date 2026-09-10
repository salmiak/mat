import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { createTestDb } from './helpers.js'

const MCP_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream'
}

const INITIALIZE = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0' }
  }
}

function createMcpApp () {
  const db = createTestDb()
  return createApp(db, {
    logging: false,
    clientDist: '/nonexistent',
    auth: {
      sessionSecret: 'test-secret',
      allowedEmails: [],
      apiTokens: ['mcp-token'],
      providers: []
    }
  })
}

// SSE responses carry the JSON-RPC message in a `data:` line
function parseMcpResponse (text: string): unknown {
  const dataLine = text.split('\n').find((l) => l.startsWith('data: '))
  return JSON.parse(dataLine ? dataLine.slice(6) : text)
}

describe('remote MCP endpoint', () => {
  it('rejects a wrong token', async () => {
    const app = createMcpApp()
    const res = await request(app).post('/mcp/wrong-token').set(MCP_HEADERS).send(INITIALIZE)
    expect(res.status).toBe(401)
  })

  it('initializes with a valid token', async () => {
    const app = createMcpApp()
    const res = await request(app).post('/mcp/mcp-token').set(MCP_HEADERS).send(INITIALIZE)
    expect(res.status).toBe(200)
    const body = parseMcpResponse(res.text) as { result: { serverInfo: { name: string } } }
    expect(body.result.serverInfo.name).toBe('mat')
  })

  it('lists the meal-planning tools', async () => {
    const app = createMcpApp()
    const res = await request(app).post('/mcp/mcp-token').set(MCP_HEADERS)
      .send({ jsonrpc: '2.0', id: 2, method: 'tools/list' })
    expect(res.status).toBe(200)
    const body = parseMcpResponse(res.text) as { result: { tools: Array<{ name: string }> } }
    const names = body.result.tools.map((t) => t.name)
    expect(names).toEqual(expect.arrayContaining(
      ['list_recipes', 'get_week', 'create_meal', 'update_meal', 'delete_meal', 'create_recipe', 'update_recipe']
    ))
  })

  it('rejects GET (stateless transport)', async () => {
    const app = createMcpApp()
    const res = await request(app).get('/mcp/mcp-token').set('Accept', 'text/event-stream')
    expect(res.status).toBe(405)
  })
})
