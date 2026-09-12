import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { extractOgTitle } from '../src/ogImage.js'
import { createTestDb } from './helpers.js'

describe('extractOgTitle', () => {
  it('prefers og:title over the title tag and decodes entities', () => {
    expect(extractOgTitle(
      '<title>Sajten</title><meta property="og:title" content="Pannkakor &amp; sylt | Recept">'
    )).toBe('Pannkakor & sylt | Recept')
  })

  it('falls back to the title tag', () => {
    expect(extractOgTitle('<title> Köttbullar &#8211; klassikern </title>')).toBe('Köttbullar – klassikern')
    expect(extractOgTitle('<p>ingen titel</p>')).toBeNull()
  })
})

describe('GET /api/link-preview', () => {
  function createPreviewApp () {
    const fetcher = vi.fn(async () => ({ title: 'Pannkakor', imageUrl: 'https://x.se/a.jpg' }))
    const app = createApp(createTestDb(), {
      logging: false,
      clientDist: '/nonexistent',
      ogImages: false,
      linkPreview: fetcher
    })
    return { app, fetcher }
  }

  it('returns the page preview', async () => {
    const { app, fetcher } = createPreviewApp()
    const res = await request(app).get('/api/link-preview?url=' + encodeURIComponent('https://x.se/recept'))
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ title: 'Pannkakor', imageUrl: 'https://x.se/a.jpg' })
    expect(fetcher).toHaveBeenCalledWith('https://x.se/recept')
  })

  it('rejects non-http urls', async () => {
    const { app } = createPreviewApp()
    expect((await request(app).get('/api/link-preview?url=ftp://x.se')).status).toBe(400)
    expect((await request(app).get('/api/link-preview')).status).toBe(400)
  })
})
