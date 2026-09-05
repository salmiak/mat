import express, { Router } from 'express'
import { eq } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { images } from '../db/schema.js'

const MAX_IMAGE_SIZE = '15mb'
const ALLOWED_TYPES = /^image\//

export function imagesRouter (db: Db): Router {
  const router = Router()

  // POST /api/images — raw image bytes in the body; returns the URL to store
  router.post('/', express.raw({ type: (req) => ALLOWED_TYPES.test(req.headers['content-type'] ?? ''), limit: MAX_IMAGE_SIZE }), async (req, res) => {
    const contentType = req.headers['content-type'] ?? ''
    if (!ALLOWED_TYPES.test(contentType) || !Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(400).json({ error: 'Send raw image data with an image/* content type' })
      return
    }

    const filename = typeof req.query.filename === 'string' ? req.query.filename : null
    const [image] = await db.insert(images).values({
      data: req.body,
      contentType,
      filename
    }).returning({ id: images.id })

    res.status(201).json({ id: image.id, url: `/api/images/${image.id}` })
  })

  // GET /api/images/:id — serve the image
  router.get('/:id', async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      res.status(404).end()
      return
    }
    const [image] = await db.select().from(images).where(eq(images.id, id))
    if (!image) {
      res.status(404).end()
      return
    }
    res.setHeader('Content-Type', image.contentType)
    // Images are immutable: a new upload gets a new id
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(image.data)
  })

  return router
}
