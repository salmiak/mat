import { vi } from 'vitest'
import mongoose from 'mongoose'

// Import the Express app without touching a real database: mongoose.connect
// is stubbed out before app.js runs.
export async function loadApp (env = {}) {
  process.env.MONGODB_URI = 'mongodb://stubbed/test'
  Object.assign(process.env, env)
  vi.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve())
  const mod = await import('../app.js')
  return mod.default
}

// Fake mongoose Query: supports the `Model.find(query, fields, cb).sort(...)`
// call style used by the routes.
export function fakeFind (docs) {
  return vi.fn((query, fields, cb) => {
    setImmediate(() => cb(null, docs))
    return { sort: () => {} }
  })
}

export function docWithSave (doc) {
  return {
    ...doc,
    save (cb) { setImmediate(() => cb(null, this)) }
  }
}
