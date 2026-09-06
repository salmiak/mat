import express, { Router } from 'express'
import { eq } from 'drizzle-orm'
import sharp from 'sharp'
import type { Db } from '../db/client.js'
import { images } from '../db/schema.js'

const MAX_IMAGE_SIZE = '15mb'
const ALLOWED_TYPES = /^image\//
const THUMB_WIDTH = 480 // 2x the largest rendered thumbnail size

async function makeThumb (data: Buffer): Promise<{ data: Buffer, contentType: string } | null> {
  try {
    const thumb = await sharp(data)
      .rotate() // apply EXIF orientation
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer()
    return { data: thumb, contentType: 'image/webp' }
  } catch (err) {
    console.warn('Thumbnail generation failed:', (err as Error).message)
    return null
  }
}

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
    const thumb = await makeThumb(req.body)
    const [image] = await db.insert(images).values({
      data: req.body,
      contentType,
      filename,
      thumbData: thumb?.data ?? null,
      thumbContentType: thumb?.contentType ?? null
    }).returning({ id: images.id })

    res.status(201).json({ id: image.id, url: `/api/images/${image.id}` })
  })

  // GET /api/images/:id — the image; ?size=thumb serves the downscaled version
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

    let body = image.data
    let contentType = image.contentType
    if (req.query.size === 'thumb') {
      if (!image.thumbData) {
        // Backfill for images uploaded/migrated before thumbnails existed
        const thumb = await makeThumb(image.data)
        if (thumb) {
          await db.update(images)
            .set({ thumbData: thumb.data, thumbContentType: thumb.contentType })
            .where(eq(images.id, id))
          image.thumbData = thumb.data
          image.thumbContentType = thumb.contentType
        }
      }
      if (image.thumbData && image.thumbContentType) {
        body = image.thumbData
        contentType = image.thumbContentType
      }
    }

    res.setHeader('Content-Type', contentType)
    // Images are immutable: a new upload gets a new id
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(body)
  })

  return router
}
