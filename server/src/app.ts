import express, { type Express, type NextFunction, type Request, type Response } from 'express'
import morgan from 'morgan'
import path from 'path'
import fs from 'fs'
import type { Db } from './db/client.js'
import { mealsRouter } from './routes/meals.js'
import { recipesRouter } from './routes/recipes.js'
import { imagesRouter } from './routes/images.js'
import { votesRouter } from './routes/votes.js'
import { authRouter, type AuthConfig } from './routes/auth.js'
import { eventsRouter } from './routes/events.js'
import { mcpRouter } from './routes/mcp.js'
import { sessionUserIdFromRequest } from './auth/session.js'
import { ChangeBus } from './events.js'
import { fetchLinkPreview, type LinkPreviewFetcher, type OgImageFetcher } from './ogImage.js'
import { generateAiImage, type AiImageGenerator } from './aiImage.js'

export interface AppOptions {
  clientDist?: string
  logging?: boolean
  /** Omit to run without authentication (local preview/tests only). */
  auth?: AuthConfig
  /** Injectable for tests; createApp makes one when omitted. */
  bus?: ChangeBus
  /** Base URL the MCP tools use to reach this server's own API. */
  selfBaseUrl?: string
  /** og:image fetching for link recipes: a fake for tests, or false to disable. */
  ogImages?: OgImageFetcher | false
  /** AI image fallback: a fake for tests, or false to disable. Off unless GEMINI_API_KEY is set. */
  aiImages?: AiImageGenerator | false
  /** Link-preview fetching (title/image for the recipe form): a fake for tests. */
  linkPreview?: LinkPreviewFetcher
}

export function createApp (db: Db, options: AppOptions = {}): Express {
  const app = express()
  if (options.logging !== false) {
    app.use(morgan('combined'))
  }
  app.use(express.json())

  const bus = options.bus ?? new ChangeBus()
  const auth = options.auth
  if (auth) {
    app.use('/api/auth', authRouter(db, auth))
    app.use('/api', (req, res, next) => {
      if (req.path.startsWith('/auth') || req.path === '/health') {
        next()
        return
      }
      const bearer = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1]
      if (bearer && (auth.apiTokens ?? []).includes(bearer)) {
        next()
        return
      }
      if (sessionUserIdFromRequest(req, auth.sessionSecret) === null) {
        res.status(401).json({ error: 'Not authenticated' })
        return
      }
      next()
    })
  } else {
    // Still mounted so the client can ask /api/auth/me and learn that no
    // login is required.
    app.get('/api/auth/me', (_req, res) => {
      res.json({ user: null, providers: [], authRequired: false })
    })
  }

  app.use('/api/meals', mealsRouter(db, bus))
  const aiImages = options.aiImages === false
    ? null
    : options.aiImages ?? (process.env.GEMINI_API_KEY ? generateAiImage : null)
  app.use('/api/recipes', recipesRouter(db, bus, options.ogImages === false ? null : options.ogImages, aiImages))
  app.use('/api/images', imagesRouter(db))
  app.use('/api/votes', votesRouter(db, bus))
  app.use('/api/events', eventsRouter(bus))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  // Title + og:image URL from a linked page, to prefill the recipe form
  const previewFetcher = options.linkPreview ?? fetchLinkPreview
  app.get('/api/link-preview', async (req, res) => {
    const url = typeof req.query.url === 'string' ? req.query.url : ''
    if (!/^https?:\/\//.test(url)) {
      res.status(400).json({ error: 'url must be an http(s) URL' })
      return
    }
    try {
      res.json(await previewFetcher(url))
    } catch {
      res.json({ title: null, imageUrl: null })
    }
  })

  // Remote MCP for Claude on mobile/claude.ai; the path token is the secret
  app.use('/mcp/:token', mcpRouter({
    apiTokens: auth ? (auth.apiTokens ?? []) : null,
    selfBaseUrl: options.selfBaseUrl ?? `http://127.0.0.1:${Number(process.env.PORT) || 8081}`
  }))

  // Built Vue client with SPA fallback (vue-router history mode)
  const clientDist = options.clientDist ?? path.join(import.meta.dirname, '..', '..', 'client', 'dist')
  if (fs.existsSync(path.join(clientDist, 'index.html'))) {
    app.use(express.static(clientDist))
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'))
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    if (!(err as { status?: number }).status) console.error(err)
    res.status(err.status ?? 500).json({ error: err.status ? err.message : 'Internal server error' })
  })

  return app
}
