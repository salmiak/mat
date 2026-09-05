import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { loadApp } from './helpers.js'

const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mat-uploads-'))
let app

beforeAll(async () => {
  app = await loadApp({ UPLOAD_DIR: uploadDir })
})

describe('POST /requestUploadURL', () => {
  it('returns a same-origin upload URL and file URL', async () => {
    const res = await request(app)
      .post('/requestUploadURL')
      .send({ name: 'bild.123.png', type: 'image/png' })

    expect(res.status).toBe(200)
    expect(res.body.uploadURL).toBe('/uploads/bild.123.png')
    expect(res.body.fileUrl).toBe('/uploads/bild.123.png')
  })

  it('rejects a missing file name', async () => {
    const res = await request(app).post('/requestUploadURL').send({})
    expect(res.status).toBe(400)
  })

  it('strips path traversal from the file name', async () => {
    const res = await request(app)
      .post('/requestUploadURL')
      .send({ name: '../../etc/evil.txt' })

    expect(res.status).toBe(200)
    expect(res.body.uploadURL).toBe('/uploads/evil.txt')
  })
})

describe('PUT + GET /uploads/:name', () => {
  it('stores the raw body and serves it back with the right content type', async () => {
    const data = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3])

    const put = await request(app)
      .put('/uploads/test.png')
      .set('Content-Type', 'image/png')
      .send(data)

    expect(put.status).toBe(200)
    expect(put.body.fileUrl).toBe('/uploads/test.png')
    expect(fs.readFileSync(path.join(uploadDir, 'test.png')).equals(data)).toBe(true)

    const get = await request(app).get('/uploads/test.png')
    expect(get.status).toBe(200)
    expect(get.headers['content-type']).toContain('image/png')
    expect(Buffer.from(get.body).equals(data)).toBe(true)
  })

  it('sanitizes the file name on PUT', async () => {
    await request(app)
      .put('/uploads/' + encodeURIComponent('..%2F..%2Fescape.txt'))
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('x'))

    expect(fs.existsSync(path.join(uploadDir, '..', 'escape.txt'))).toBe(false)
  })
})
