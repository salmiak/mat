const BASE = '/api'

export class ApiError extends Error {
  constructor (message: string, public status: number) {
    super(message)
  }
}

// The auth store registers itself here so an expired session on any API
// call sends the user to the login page (avoids a circular import).
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler (handler: () => void) {
  onUnauthorized = handler
}

async function requestJson<T> (method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth')) {
      onUnauthorized?.()
    }
    throw new ApiError(`API ${method} ${path} failed: ${res.status}`, res.status)
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => requestJson<T>('GET', path),
  post: <T>(path: string, body: unknown) => requestJson<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => requestJson<T>('PUT', path, body),
  delete: <T>(path: string) => requestJson<T>('DELETE', path),

  async uploadImage (file: File): Promise<{ id: number, url: string }> {
    const res = await fetch(`${BASE}/images?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'image/jpeg' },
      body: file
    })
    if (!res.ok) {
      throw new Error(`Image upload failed: ${res.status}`)
    }
    return res.json()
  }
}
