const BASE = '/api'

async function requestJson<T> (method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    throw new Error(`API ${method} ${path} failed: ${res.status}`)
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
