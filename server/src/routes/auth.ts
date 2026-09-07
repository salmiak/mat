import { Router } from 'express'
import { eq } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { users } from '../db/schema.js'
import { enabledProviders, verifyIdToken as defaultVerifier, type EnabledProvider, type IdTokenVerifier } from '../auth/providers.js'
import { clearSessionCookie, createSessionToken, sessionUserIdFromRequest, setSessionCookie } from '../auth/session.js'

export interface AuthConfig {
  sessionSecret: string
  /** Lower-cased emails that are allowed to sign in. Empty = nobody. */
  allowedEmails: string[]
  /** Injectable for tests; defaults to real JWKS verification. */
  verifyIdToken?: IdTokenVerifier
  providers?: EnabledProvider[]
}

function serializeUser (user: typeof users.$inferSelect) {
  return { id: user.id, email: user.email, name: user.name, picture: user.picture }
}

export function authRouter (db: Db, config: AuthConfig): Router {
  const router = Router()
  const verify = config.verifyIdToken ?? defaultVerifier

  // Status query, not a protected resource: always 200 so the client can
  // read the provider list without special-casing errors.
  router.get('/me', async (req, res) => {
    const providers = config.providers ?? enabledProviders()
    const base = { user: null, providers, authRequired: true }
    const userId = sessionUserIdFromRequest(req, config.sessionSecret)
    if (userId === null) {
      res.json(base)
      return
    }
    const [user] = await db.select().from(users).where(eq(users.id, userId))
    if (!user) {
      clearSessionCookie(res)
      res.json(base)
      return
    }
    res.json({ ...base, user: serializeUser(user) })
  })

  router.post('/logout', (_req, res) => {
    clearSessionCookie(res)
    res.json({ ok: true })
  })

  router.post('/:provider', async (req, res) => {
    const idToken = typeof req.body?.credential === 'string' ? req.body.credential : ''
    if (!idToken) {
      res.status(400).json({ error: 'Missing credential' })
      return
    }
    const identity = await verify(req.params.provider, idToken)
    const email = identity.email.toLowerCase()
    if (!identity.emailVerified || !config.allowedEmails.includes(email)) {
      res.status(403).json({ error: 'Not allowed' })
      return
    }

    const values = {
      email,
      name: identity.name,
      picture: identity.picture,
      provider: identity.provider,
      providerSub: identity.sub,
      lastLoginAt: new Date()
    }
    const [user] = await db.insert(users).values(values)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          // Keep an existing non-empty name/picture: Apple only sends the
          // name on the very first authorization.
          ...(identity.name ? { name: identity.name } : {}),
          ...(identity.picture ? { picture: identity.picture } : {}),
          provider: identity.provider,
          providerSub: identity.sub,
          lastLoginAt: values.lastLoginAt
        }
      })
      .returning()

    setSessionCookie(res, createSessionToken(user.id, config.sessionSecret))
    res.json({ user: serializeUser(user) })
  })

  return router
}
