import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

export interface VerifiedIdentity {
  provider: string
  sub: string
  email: string
  emailVerified: boolean
  name: string
  picture: string
}

export type IdTokenVerifier = (provider: string, idToken: string) => Promise<VerifiedIdentity>

interface ProviderConfig {
  jwksUrl: string
  issuers: string[]
  audienceEnv: string
}

// Apple uses the same OIDC id-token flow; enable it by setting
// APPLE_CLIENT_ID (the Services ID) once an Apple Developer account exists.
const PROVIDERS: Record<string, ProviderConfig> = {
  google: {
    jwksUrl: 'https://www.googleapis.com/oauth2/v3/certs',
    issuers: ['https://accounts.google.com', 'accounts.google.com'],
    audienceEnv: 'GOOGLE_CLIENT_ID'
  },
  apple: {
    jwksUrl: 'https://appleid.apple.com/auth/keys',
    issuers: ['https://appleid.apple.com'],
    audienceEnv: 'APPLE_CLIENT_ID'
  }
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

export interface EnabledProvider {
  name: string
  clientId: string
}

export function enabledProviders (): EnabledProvider[] {
  return Object.keys(PROVIDERS)
    .map((name) => ({ name, clientId: process.env[PROVIDERS[name].audienceEnv] ?? '' }))
    .filter((p) => p.clientId !== '')
}

export const verifyIdToken: IdTokenVerifier = async (provider, idToken) => {
  const config = PROVIDERS[provider]
  if (!config) throw Object.assign(new Error(`Unknown provider: ${provider}`), { status: 400 })
  const audience = process.env[config.audienceEnv]
  if (!audience) throw Object.assign(new Error(`Provider not configured: ${provider}`), { status: 400 })

  let jwks = jwksCache.get(provider)
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(config.jwksUrl))
    jwksCache.set(provider, jwks)
  }

  let payload: JWTPayload
  try {
    ({ payload } = await jwtVerify(idToken, jwks, { issuer: config.issuers, audience }))
  } catch {
    throw Object.assign(new Error('Invalid id token'), { status: 401 })
  }

  const email = typeof payload.email === 'string' ? payload.email : ''
  if (!email || !payload.sub) {
    throw Object.assign(new Error('Id token missing email'), { status: 401 })
  }
  return {
    provider,
    sub: payload.sub,
    email,
    // Apple omits the claim for verified private-relay addresses; treat absent as verified.
    emailVerified: payload.email_verified !== false && payload.email_verified !== 'false',
    name: typeof payload.name === 'string' ? payload.name : '',
    picture: typeof payload.picture === 'string' ? payload.picture : ''
  }
}
