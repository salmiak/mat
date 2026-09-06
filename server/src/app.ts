import express, { type Express, type NextFunction, type Request, type Response } from 'express'
import morgan from 'morgan'
import path from 'path'
import fs from 'fs'
import type { Db } from './db/client.js'
import { mealsRouter } from './routes/meals.js'
import { recipesRouter } from './routes/recipes.js'
import { imagesRouter } from './routes/images.js'
import { votesRouter } from './routes/votes.js'

export interface AppOptions {
  clientDist?: string
  logging?: boolean
}

export function createApp (db: Db, options: AppOptions = {}): Express {
  const app = express()
  if (options.logging !== false) {
    app.use(morgan('combined'))
  }
  app.use(express.json())

  app.use('/api/meals', mealsRouter(db))
  app.use('/api/recipes', recipesRouter(db))
  app.use('/api/images', imagesRouter(db))
  app.use('/api/votes', votesRouter(db))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

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
    console.error(err)
    res.status(err.status ?? 500).json({ error: err.status ? err.message : 'Internal server error' })
  })

  return app
}
