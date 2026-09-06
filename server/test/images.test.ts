import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import sharp from 'sharp'
import type { Express } from 'express'
import { createTestApp } from './helpers.js'

let app: Express

beforeEach(() => {
  app = createTestApp().app
})

describe('GET /api/images/:id?size=thumb', () => {
  it('serves a downscaled webp thumbnail', async () => {
    const original = await sharp({
      create: { width: 1200, height: 900, channels: 3, background: { r: 200, g: 40, b: 40 } }
    }).png().toBuffer()

    const post = await request(app)
      .post('/api/images')
      .set('Content-Type', 'image/png')
      .send(original)
    expect(post.status).toBe(201)

    const thumb = await request(app).get(post.body.url + '?size=thumb')
    expect(thumb.status).toBe(200)
    expect(thumb.headers['content-type']).toBe('image/webp')

    const meta = await sharp(thumb.body).metadata()
    expect(meta.width).toBe(480)

    // The original stays untouched
    const full = await request(app).get(post.body.url)
    expect(full.headers['content-type']).toBe('image/png')
    expect((await sharp(full.body).metadata()).width).toBe(1200)
  })

  it('falls back to the original for non-image data', async () => {
    // Bytes that claim to be an image but aren't — thumbnailing fails gracefully
    const post = await request(app)
      .post('/api/images')
      .set('Content-Type', 'image/png')
      .send(Buffer.from('not really a png'))

    const res = await request(app).get(post.body.url + '?size=thumb')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toBe('image/png')
  })
})

describe('POST + GET /api/images', () => {
  it('stores raw image bytes and serves them back', async () => {
    const data = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3])

    const post = await request(app)
      .post('/api/images')
      .query({ filename: 'test.png' })
      .set('Content-Type', 'image/png')
      .send(data)

    expect(post.status).toBe(201)
    expect(post.body.url).toBe(`/api/images/${post.body.id}`)

    const get = await request(app).get(post.body.url)
    expect(get.status).toBe(200)
    expect(get.headers['content-type']).toBe('image/png')
    expect(get.headers['cache-control']).toContain('immutable')
    expect(Buffer.from(get.body).equals(data)).toBe(true)
  })

  it('rejects non-image content types', async () => {
    const res = await request(app)
      .post('/api/images')
      .set('Content-Type', 'application/x-sh')
      .send(Buffer.from('#!/bin/sh'))

    expect(res.status).toBe(400)
  })

  it('rejects an empty body', async () => {
    const res = await request(app).post('/api/images').set('Content-Type', 'image/png').send()
    expect(res.status).toBe(400)
  })

  it('404s on a missing image', async () => {
    const res = await request(app).get('/api/images/424242')
    expect(res.status).toBe(404)
  })
})
