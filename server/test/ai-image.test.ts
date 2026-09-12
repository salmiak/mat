import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import sharp from 'sharp'
import { createApp } from '../src/app.js'
import type { AiImageGenerator } from '../src/aiImage.js'
import type { OgImageFetcher } from '../src/ogImage.js'
import { createTestDb } from './helpers.js'

async function tinyPng (): Promise<Buffer> {
  return sharp({ create: { width: 8, height: 8, channels: 3, background: { r: 9, g: 8, b: 7 } } })
    .png().toBuffer()
}

function createAiApp (ai: AiImageGenerator, og: OgImageFetcher | false = false) {
  const db = createTestDb()
  return createApp(db, {
    logging: false,
    clientDist: '/nonexistent',
    ogImages: og,
    aiImages: ai
  })
}

describe('AI image fallback', () => {
  it('generates an image for a recipe without link or image', async () => {
    const ai = vi.fn(async () => ({ data: await tinyPng(), contentType: 'image/png' }))
    const app = createAiApp(ai)

    await request(app).post('/api/recipes').send({ title: 'Pannkakor 🤖', comment: 'Vispa och stek' })
    await vi.waitFor(async () => {
      const { body } = await request(app).get('/api/recipes')
      expect(body.recipes[0].imageUrl).toMatch(/^\/api\/images\/\d+$/)
    })
    expect(ai).toHaveBeenCalledWith('Pannkakor 🤖', 'Vispa och stek')
  })

  it('runs only when the og image fails, and og replaces ai later', async () => {
    const ai = vi.fn(async () => ({ data: await tinyPng(), contentType: 'image/png' }))
    let ogWorks = false
    const og: OgImageFetcher = async () =>
      ogWorks ? { data: await tinyPng(), contentType: 'image/png' } : null
    const app = createAiApp(ai, og)

    // og fails -> AI image
    const created = await request(app).post('/api/recipes')
      .send({ title: 'Länkrätt', url: 'https://x.se/1' })
    const id = created.body.recipe.id
    await vi.waitFor(() => expect(ai).toHaveBeenCalledTimes(1))

    // link changes and og now works -> the real photo replaces the AI one
    ogWorks = true
    const before = (await request(app).get('/api/recipes')).body.recipes[0].imageUrl
    await request(app).put(`/api/recipes/${id}`)
      .send({ title: 'Länkrätt', url: 'https://x.se/2', imageUrl: before })
    await vi.waitFor(async () => {
      const { body } = await request(app).get('/api/recipes')
      expect(body.recipes[0].imageUrl).not.toBe(before)
    })
    expect(ai).toHaveBeenCalledTimes(1)
  })

  it('never runs for a recipe with an uploaded image', async () => {
    const ai = vi.fn(async () => ({ data: await tinyPng(), contentType: 'image/png' }))
    const app = createAiApp(ai)

    const upload = await request(app).post('/api/images')
      .set('Content-Type', 'image/png').send(await tinyPng())
    await request(app).post('/api/recipes').send({ title: 'Med bild', imageUrl: upload.body.url })
    await new Promise((r) => setTimeout(r, 50))
    expect(ai).not.toHaveBeenCalled()
  })

  it('regenerate-ai-images re-renders AI images but never uploads', async () => {
    const ai = vi.fn(async () => ({ data: await tinyPng(), contentType: 'image/png' }))
    const app = createAiApp(ai)

    // One AI-imaged recipe, one with an uploaded image
    await request(app).post('/api/recipes').send({ title: 'AI-rätt' })
    await vi.waitFor(() => expect(ai).toHaveBeenCalledTimes(1))
    const upload = await request(app).post('/api/images')
      .set('Content-Type', 'image/png').send(await tinyPng())
    await request(app).post('/api/recipes').send({ title: 'Uppladdad', imageUrl: upload.body.url })

    const before = (await request(app).get('/api/recipes')).body.recipes
    const aiBefore = before.find((r: { title: string }) => r.title === 'AI-rätt').imageUrl

    const res = await request(app).post('/api/recipes/regenerate-ai-images')
    expect(res.status).toBe(202)
    expect(res.body.queued).toBe(1)

    await vi.waitFor(async () => {
      const { body } = await request(app).get('/api/recipes')
      const aiAfter = body.recipes.find((r: { title: string }) => r.title === 'AI-rätt').imageUrl
      expect(aiAfter).not.toBe(aiBefore)
    })
    expect(ai).toHaveBeenCalledTimes(2)

    // The uploaded recipe is untouched and the old AI image row is gone
    const { body } = await request(app).get('/api/recipes')
    expect(body.recipes.find((r: { title: string }) => r.title === 'Uppladdad').imageUrl).toBe(upload.body.url)
    expect((await request(app).get(aiBefore)).status).toBe(404)
  })

  it('generate-ai-image replaces the image on request, with draft overrides', async () => {
    const ai = vi.fn(async () => ({ data: await tinyPng(), contentType: 'image/png' }))
    const app = createAiApp(ai)

    // Recipe with an uploaded image — the explicit request replaces even that
    const upload = await request(app).post('/api/images')
      .set('Content-Type', 'image/png').send(await tinyPng())
    const recipe = (await request(app).post('/api/recipes')
      .send({ title: 'Sparad titel', imageUrl: upload.body.url })).body.recipe

    const res = await request(app)
      .post(`/api/recipes/${recipe.id}/generate-ai-image`)
      .send({ title: 'Utkast-titel', comment: 'utkast' })

    expect(res.status).toBe(200)
    expect(ai).toHaveBeenCalledWith('Utkast-titel', 'utkast')
    expect(res.body.recipe.imageSource).toBe('ai')
    expect(res.body.recipe.imageUrl).not.toBe(upload.body.url)
    // The replaced image row is deleted
    expect((await request(app).get(upload.body.url)).status).toBe(404)
  })

  it('generate-ai-image 404s on a missing recipe and 422s when generation fails', async () => {
    const failing = vi.fn(async () => null)
    const app = createAiApp(failing)
    expect((await request(app).post('/api/recipes/999/generate-ai-image').send({})).status).toBe(404)

    const recipe = (await request(app).post('/api/recipes').send({ title: 'X' })).body.recipe
    expect((await request(app).post(`/api/recipes/${recipe.id}/generate-ai-image`).send({})).status).toBe(422)
  })

  it('a failed generation leaves the recipe without an image', async () => {
    const ai = vi.fn(async () => null)
    const app = createAiApp(ai)
    await request(app).post('/api/recipes').send({ title: 'Utan bild' })
    await vi.waitFor(() => expect(ai).toHaveBeenCalled())
    const { body } = await request(app).get('/api/recipes')
    expect(body.recipes[0].imageUrl).toBeNull()
  })
})
