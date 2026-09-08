import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Request, Response } from 'express'

const COOKIE_NAME = 'mat_session'
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface SessionPayload {
  uid: number
  exp: number
}

function b64url (data: string | Buffer): string {
  return Buffer.from(data).toString('base64url')
}

function sign (data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

export function createSessionToken (userId: number, secret: string, ttlMs = DEFAULT_TTL_MS): string {
  const payload = b64url(JSON.stringify({ uid: userId, exp: Date.now() + ttlMs } satisfies SessionPayload))
  return `${payload}.${sign(payload, secret)}`
}

export function verifySessionToken (token: string, secret: string): number | null {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return null
  const payload = token.slice(0, dot)
  const mac = token.slice(dot + 1)
  const expected = sign(payload, secret)
  const macBuf = Buffer.from(mac)
  const expectedBuf = Buffer.from(expected)
  if (macBuf.length !== expectedBuf.length || !timingSafeEqual(macBuf, expectedBuf)) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionPayload
    if (typeof parsed.uid !== 'number' || typeof parsed.exp !== 'number') return null
    if (parsed.exp < Date.now()) return null
    return parsed.uid
  } catch {
    return null
  }
}

export function sessionUserIdFromRequest (req: Request, secret: string): number | null {
  const header = req.headers.cookie
  if (!header) return null
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    if (part.slice(0, eq).trim() !== COOKIE_NAME) continue
    return verifySessionToken(decodeURIComponent(part.slice(eq + 1).trim()), secret)
  }
  return null
}

export function setSessionCookie (res: Response, token: string, ttlMs = DEFAULT_TTL_MS) {
  res.setHeader('Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.floor(ttlMs / 1000)}; HttpOnly; SameSite=Lax` +
    (process.env.NODE_ENV === 'production' ? '; Secure' : ''))
}

export function clearSessionCookie (res: Response) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`)
}
