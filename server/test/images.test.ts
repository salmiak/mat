import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers.js'

let app: Express

beforeEach(() => {
  app = createTestApp().app
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
