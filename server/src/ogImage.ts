import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import sharp from 'sharp'
import { eq, and, or, isNull } from 'drizzle-orm'
import type { Db } from './db/client.js'
import type { ChangeBus } from './events.js'
import { images, recipes } from './db/schema.js'
import { storeImage } from './routes/images.js'
import { serializeRecipe } from './routes/recipes.js'

const FETCH_TIMEOUT_MS = 5_000
const MAX_HTML_BYTES = 2_000_000
const MAX_IMAGE_BYTES = 15_000_000
const MAX_WIDTH = 1200 // og originals are recompressed — we only need thumbnail + detail size
const USER_AGENT = 'Mozilla/5.0 (compatible; MatBot/1.0; +https://mat.bkmn.se)'

// og:image / twitter:image from a page's meta tags, resolved against the page URL.
// Handles either attribute order and both property= and name=.
export function extractOgImageUrl (html: string, pageUrl: string): string | null {
  const metas = html.match(/<meta\s[^>]*>/gi) ?? []
  let fallback = null
  for (const tag of metas) {
    const key = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase()
    const content = /content\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]
    if (!key || !content) continue
    try {
      if (key === 'og:image' || key === 'og:image:url' || key === 'og:image:secure_url') {
        return new URL(content, pageUrl).href
      }
      if (key === 'twitter:image' || key === 'twitter:image:src') {
        fallback ??= new URL(content, pageUrl).href
      }
    } catch { /* unparsable URL in the tag — skip it */ }
  }
  return fallback
}

// SSRF guard: only http(s), and the host must not resolve to a private,
// loopback or link-local address.
export async function isSafeUrl (rawUrl: string): Promise<boolean> {
  let url
  try {
    url = new URL(rawUrl)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  const host = url.hostname.replace(/^\[|\]$/g, '')
  try {
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true })
    return addresses.every(({ address }) => !isPrivateAddress(address))
  } catch {
    return false
  }
}

function isPrivateAddress (ip: string): boolean {
  if (ip.includes(':')) {
    const v6 = ip.toLowerCase()
    if (v6 === '::1' || v6 === '::') return true
    if (v6.startsWith('fe80:') || v6.startsWith('fc') || v6.startsWith('fd')) return true
    const v4mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(v6)
    return v4mapped ? isPrivateAddress(v4mapped[1]) : false
  }
  const parts = ip.split('.').map(Number)
  const [a, b] = parts
  return a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
}

// fetch that validates every redirect hop against the SSRF guard
async function safeFetch (url: string, accept: string, maxHops = 3): Promise<Response | null> {
  let current = url
  for (let hop = 0; hop <= maxHops; hop++) {
    if (!await isSafeUrl(current)) return null
    const res = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': USER_AGENT, Accept: accept }
    })
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) return null
      current = new URL(location, current).href
      continue
    }
    return res.ok ? res : null
  }
  return null
}

// og:title, falling back to the <title> tag
export function extractOgTitle (html: string): string | null {
  const decode = (s: string) => s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .trim()
  for (const tag of html.match(/<meta\s[^>]*>/gi) ?? []) {
    const key = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase()
    const content = /content\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]
    if (key === 'og:title' && content) return decode(content)
  }
  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]
  return title ? decode(title) : null
}

export interface LinkPreview {
  title: string | null
  imageUrl: string | null
}

export type LinkPreviewFetcher = (pageUrl: string) => Promise<LinkPreview>

// Page title + og:image URL for prefilling the recipe form — nothing is
// downloaded or stored; the image is fetched properly on save.
export const fetchLinkPreview: LinkPreviewFetcher = async (pageUrl) => {
  const res = await safeFetch(pageUrl, 'text/html')
  if (!res) return { title: null, imageUrl: null }
  const html = (await res.text()).slice(0, MAX_HTML_BYTES)
  return {
    title: extractOgTitle(html),
    imageUrl: extractOgImageUrl(html, res.url || pageUrl)
  }
}

export type OgImageFetcher = (pageUrl: string) => Promise<{ data: Buffer, contentType: string } | null>

// Downloads the linked page, finds its og:image, and recompresses it to a
// size-capped webp. Returns null (and stays quiet) on any failure.
export const fetchOgImage: OgImageFetcher = async (pageUrl) => {
  const pageRes = await safeFetch(pageUrl, 'text/html')
  if (!pageRes) return null
  const lengthHeader = Number(pageRes.headers.get('content-length'))
  if (lengthHeader > MAX_HTML_BYTES) return null
  const html = (await pageRes.text()).slice(0, MAX_HTML_BYTES)

  const imageUrl = extractOgImageUrl(html, pageRes.url || pageUrl)
  if (!imageUrl) return null

  const imageRes = await safeFetch(imageUrl, 'image/*')
  if (!imageRes || !/^image\//.test(imageRes.headers.get('content-type') ?? '')) return null
  const raw = Buffer.from(await imageRes.arrayBuffer())
  if (raw.length === 0 || raw.length > MAX_IMAGE_BYTES) return null

  const data = await sharp(raw)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()
  return { data, contentType: 'image/webp' }
}

// Fire-and-forget: fetch the og:image for a link recipe and attach it,
// unless a person has attached an image in the meantime. Broadcasts the
// updated recipe so open clients see the thumbnail appear.
export async function attachOgImage (
  db: Db,
  bus: ChangeBus | undefined,
  recipeId: number,
  fetcher: OgImageFetcher = fetchOgImage
): Promise<void> {
  try {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId))
    if (!recipe || !recipe.url) return
    if (recipe.imageSource === 'upload' || recipe.legacyImageUrl) return
    if (recipe.imageId !== null && recipe.imageSource !== 'og') return

    const fetched = await fetcher(recipe.url)
    if (!fetched) return
    const imageId = await storeImage(db, fetched.data, fetched.contentType, 'og-image.webp')

    const previousImageId = recipe.imageId
    // Guard against a concurrent manual upload: attach only while the
    // recipe still has no person-chosen image.
    const [updated] = await db.update(recipes)
      .set({ imageId, imageSource: 'og', updatedAt: new Date() })
      .where(and(
        eq(recipes.id, recipeId),
        or(isNull(recipes.imageSource), eq(recipes.imageSource, 'og'))
      ))
      .returning()
    if (!updated) {
      await db.delete(images).where(eq(images.id, imageId))
      return
    }

    // The replaced og image is machine-fetched — drop the orphaned blob
    if (previousImageId !== null) {
      await db.delete(images).where(eq(images.id, previousImageId))
    }

    bus?.publish({ resource: 'recipes', action: 'saved', recipe: serializeRecipe(updated) })
  } catch (err) {
    console.warn(`og-image fetch failed for recipe ${recipeId}:`, (err as Error).message)
  }
}
