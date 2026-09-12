import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import sharp from 'sharp'
import { createApp } from '../src/app.js'
import { extractOgImageUrl, isSafeUrl, type OgImageFetcher } from '../src/ogImage.js'
import { createTestDb } from './helpers.js'

describe('extractOgImageUrl', () => {
  it('finds og:image regardless of attribute order', () => {
    expect(extractOgImageUrl(
      '<meta property="og:image" content="https://x.se/a.jpg">', 'https://x.se/r'
    )).toBe('https://x.se/a.jpg')
    expect(extractOgImageUrl(
      '<meta content="https://x.se/b.jpg" property="og:image" />', 'https://x.se/r'
    )).toBe('https://x.se/b.jpg')
  })

  it('resolves relative URLs against the page', () => {
    expect(extractOgImageUrl(
      '<meta property="og:image" content="/img/a.jpg">', 'https://x.se/recept/1'
    )).toBe('https://x.se/img/a.jpg')
  })

  it('falls back to twitter:image', () => {
    expect(extractOgImageUrl(
      '<meta name="twitter:image" content="https://x.se/t.jpg">', 'https://x.se/r'
    )).toBe('https://x.se/t.jpg')
  })

  it('prefers og:image over twitter:image and handles missing tags', () => {
    expect(extractOgImageUrl(
      '<meta name="twitter:image" content="https://x.se/t.jpg"><meta property="og:image" content="https://x.se/og.jpg">',
      'https://x.se/r'
    )).toBe('https://x.se/og.jpg')
    expect(extractOgImageUrl('<html><head></head></html>', 'https://x.se/r')).toBeNull()
  })
})

describe('isSafeUrl', () => {
  it('rejects non-http and private addresses', async () => {
    expect(await isSafeUrl('ftp://x.se/a')).toBe(false)
    expect(await isSafeUrl('http://127.0.0.1/a')).toBe(false)
    expect(await isSafeUrl('http://10.0.0.5/a')).toBe(false)
    expect(await isSafeUrl('http://192.168.1.1/a')).toBe(false)
    expect(await isSafeUrl('http://169.254.169.254/latest/meta-data')).toBe(false)
    expect(await isSafeUrl('http://[::1]/a')).toBe(false)
    expect(await isSafeUrl('inte en url')).toBe(false)
  })
})

async function tinyPng (): Promise<Buffer> {
  return sharp({ create: { width: 8, height: 8, channels: 3, background: { r: 1, g: 2, b: 3 } } })
    .png().toBuffer()
}

function createOgApp (fetcher: OgImageFetcher) {
  const db = createTestDb()
  const app = createApp(db, { logging: false, clientDist: '/nonexistent', ogImages: fetcher, aiImages: false })
  return app
}

describe('og image attachment', () => {
  it('attaches a fetched image to a link recipe and serves it', async () => {
    const fetcher = vi.fn(async () => ({ data: await tinyPng(), contentType: 'image/png' }))
    const app = createOgApp(fetcher)

    const created = await request(app).post('/api/recipes')
      .send({ title: 'Länkrecept', url: 'https://recept.example/1' })
    expect(created.body.recipe.imageUrl).toBeNull()

    await vi.waitFor(async () => {
      const { body } = await request(app).get('/api/recipes')
      expect(body.recipes[0].imageUrl).toMatch(/^\/api\/images\/\d+$/)
    })
    expect(fetcher).toHaveBeenCalledWith('https://recept.example/1')

    const { body } = await request(app).get('/api/recipes')
    const image = await request(app).get(body.recipes[0].imageUrl)
    expect(image.status).toBe(200)
  })

  it('does not fetch when the recipe has an uploaded image', async () => {
    const fetcher = vi.fn(async () => ({ data: await tinyPng(), contentType: 'image/png' }))
    const app = createOgApp(fetcher)

    const upload = await request(app).post('/api/images')
      .set('Content-Type', 'image/png')
      .send(await tinyPng())
    await request(app).post('/api/recipes')
      .send({ title: 'Med bild', url: 'https://recept.example/2', imageUrl: upload.body.url })

    await new Promise((r) => setTimeout(r, 50))
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('refetches when the link changes, but never over an upload', async () => {
    const fetcher = vi.fn(async () => ({ data: await tinyPng(), contentType: 'image/png' }))
    const app = createOgApp(fetcher)

    const created = await request(app).post('/api/recipes')
      .send({ title: 'Länk', url: 'https://recept.example/1' })
    const id = created.body.recipe.id
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

    // Same url on an ordinary edit: no refetch
    await request(app).put(`/api/recipes/${id}`)
      .send({ title: 'Länk!', url: 'https://recept.example/1', imageUrl: `/api/images/1` })
    await new Promise((r) => setTimeout(r, 50))
    expect(fetcher).toHaveBeenCalledTimes(1)

    // Changed url: refetch replaces the og image
    await request(app).put(`/api/recipes/${id}`)
      .send({ title: 'Länk!', url: 'https://recept.example/other', imageUrl: `/api/images/1` })
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    await vi.waitFor(async () => {
      const { body } = await request(app).get('/api/recipes')
      expect(body.recipes[0].imageUrl).not.toBe('/api/images/1')
    })

    // Person uploads an image: og fetching stops even if the url changes
    const upload = await request(app).post('/api/images')
      .set('Content-Type', 'image/png')
      .send(await tinyPng())
    await request(app).put(`/api/recipes/${id}`)
      .send({ title: 'Länk!', url: 'https://recept.example/third', imageUrl: upload.body.url })
    await new Promise((r) => setTimeout(r, 50))
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('a failed fetch leaves the recipe without an image', async () => {
    const fetcher = vi.fn(async () => null)
    const app = createOgApp(fetcher)
    await request(app).post('/api/recipes')
      .send({ title: 'Trasig länk', url: 'https://recept.example/404' })
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
    const { body } = await request(app).get('/api/recipes')
    expect(body.recipes[0].imageUrl).toBeNull()
  })
})
