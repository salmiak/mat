import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import type { VerifiedIdentity } from '../src/auth/providers.js'
import { createTestDb } from './helpers.js'

const SECRET = 'test-secret'

function identity (overrides: Partial<VerifiedIdentity> = {}): VerifiedIdentity {
  return {
    provider: 'google',
    sub: 'sub-123',
    email: 'anna@example.com',
    emailVerified: true,
    name: 'Anna',
    picture: 'https://example.com/anna.png',
    ...overrides
  }
}

function createAuthedApp (result: VerifiedIdentity | Error = identity()) {
  const db = createTestDb()
  const app = createApp(db, {
    logging: false,
    clientDist: '/nonexistent',
    auth: {
      sessionSecret: SECRET,
      allowedEmails: ['anna@example.com'],
      providers: [{ name: 'google', clientId: 'test-client' }],
      verifyIdToken: async () => {
        if (result instanceof Error) throw result
        return result
      }
    }
  })
  return { app, db }
}

async function login (app: ReturnType<typeof createAuthedApp>['app']) {
  const res = await request(app).post('/api/auth/google').send({ credential: 'token' })
  expect(res.status).toBe(200)
  const cookie = res.headers['set-cookie']![0].split(';')[0]
  return cookie
}

describe('auth', () => {
  it('rejects API requests without a session', async () => {
    const { app } = createAuthedApp()
    expect((await request(app).get('/api/meals?week=1&year=2026')).status).toBe(401)
    expect((await request(app).post('/api/recipes').send({ title: 'x' })).status).toBe(401)
  })

  it('leaves health open and reports providers on /me', async () => {
    const { app } = createAuthedApp()
    expect((await request(app).get('/api/health')).status).toBe(200)
    const me = await request(app).get('/api/auth/me')
    expect(me.status).toBe(200)
    expect(me.body).toEqual({
      user: null,
      providers: [{ name: 'google', clientId: 'test-client' }],
      authRequired: true
    })
  })

  it('logs in an allowed user, creates it, and grants API access', async () => {
    const { app } = createAuthedApp()
    const cookie = await login(app)

    const me = await request(app).get('/api/auth/me').set('Cookie', cookie)
    expect(me.status).toBe(200)
    expect(me.body.user).toMatchObject({ email: 'anna@example.com', name: 'Anna' })

    const meals = await request(app).get('/api/meals?week=1&year=2026').set('Cookie', cookie)
    expect(meals.status).toBe(200)
  })

  it('updates the existing user on repeat login instead of duplicating', async () => {
    const { app } = createAuthedApp()
    await login(app)
    const res = await request(app).post('/api/auth/google').send({ credential: 'token' })
    expect(res.status).toBe(200)
    expect(res.body.user.id).toBe(1)
  })

  it('rejects emails outside the allowlist', async () => {
    const { app } = createAuthedApp(identity({ email: 'evil@example.com' }))
    const res = await request(app).post('/api/auth/google').send({ credential: 'token' })
    expect(res.status).toBe(403)
  })

  it('rejects unverified emails', async () => {
    const { app } = createAuthedApp(identity({ emailVerified: false }))
    const res = await request(app).post('/api/auth/google').send({ credential: 'token' })
    expect(res.status).toBe(403)
  })

  it('rejects invalid tokens with the verifier error status', async () => {
    const { app } = createAuthedApp(Object.assign(new Error('Invalid id token'), { status: 401 }))
    const res = await request(app).post('/api/auth/google').send({ credential: 'bad' })
    expect(res.status).toBe(401)
  })

  it('rejects tampered session cookies', async () => {
    const { app } = createAuthedApp()
    const cookie = await login(app)
    const tampered = cookie.slice(0, -4) + 'AAAA'
    const res = await request(app).get('/api/meals?week=1&year=2026').set('Cookie', tampered)
    expect(res.status).toBe(401)
  })

  it('logout clears the cookie', async () => {
    const { app } = createAuthedApp()
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(200)
    expect(res.headers['set-cookie']![0]).toContain('Max-Age=0')
  })

  it('runs open when auth is not configured', async () => {
    const { app } = (await import('./helpers.js')).createTestApp()
    expect((await request(app).get('/api/meals?week=1&year=2026')).status).toBe(200)
    const me = await request(app).get('/api/auth/me')
    expect(me.status).toBe(200)
    expect(me.body).toEqual({ user: null, providers: [], authRequired: false })
  })
})
