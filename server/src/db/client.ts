import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'

export type Db = NodePgDatabase<typeof schema>

export function createDb (connectionString: string): { db: Db, pool: pg.Pool } {
  const pool = new pg.Pool({ connectionString })
  const db = drizzle(pool, { schema })
  return { db, pool }
}
