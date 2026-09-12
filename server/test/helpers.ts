import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { newDb } from 'pg-mem'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../src/db/schema.js'
import { createApp } from '../src/app.js'
import type { Db } from '../src/db/client.js'

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'drizzle')

// In-memory Postgres (pg-mem) with the real migrations applied.
export function createTestDb (): Db {
  const mem = newDb()
  for (const file of fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    for (const statement of sql.split('--> statement-breakpoint')) {
      mem.public.none(statement)
    }
  }
  const { Pool } = mem.adapters.createPg()
  const pool = new Pool()
  // Drizzle passes `types` and `rowMode: 'array'` options that pg-mem's pg
  // adapter doesn't understand: strip them, and emulate array row mode using
  // the field list of the result.
  const rawQuery = pool.query.bind(pool)
  pool.query = async (config: unknown, ...rest: unknown[]) => {
    let arrayMode = false
    if (config && typeof config === 'object') {
      const c = config as Record<string, unknown>
      delete c.types
      arrayMode = c.rowMode === 'array'
      delete c.rowMode
    }
    const result = await rawQuery(config, ...rest)
    if (arrayMode && Array.isArray(result?.rows)) {
      // pg-mem leaves fields empty for INSERT..RETURNING; the row keys are in
      // returning-clause order there, so fall back to them.
      const fieldNames: string[] = (result.fields ?? []).map((f: { name: string }) => f.name)
      result.rows = result.rows.map((row: Record<string, unknown>) => {
        const names = fieldNames.length > 0 ? fieldNames : Object.keys(row)
        return names.map((n) => row[n])
      })
    }
    return result
  }
  return drizzle(pool, { schema }) as unknown as Db
}

export function createTestApp () {
  const db = createTestDb()
  const app = createApp(db, { logging: false, clientDist: '/nonexistent', ogImages: false })
  return { app, db }
}
