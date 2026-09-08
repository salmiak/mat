import path from 'path'
import fs from 'fs'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { createDb } from './db/client.js'
import { createApp } from './app.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('No database configured. Set DATABASE_URL to a PostgreSQL connection string.')
  process.exit(1)
}

const { db } = createDb(connectionString)

// The build copies drizzle/ into dist/; in dev (tsx) it sits next to src/.
const localMigrations = path.join(import.meta.dirname, 'drizzle')
const migrationsFolder = fs.existsSync(localMigrations)
  ? localMigrations
  : path.join(import.meta.dirname, '..', 'drizzle')

await migrate(db, { migrationsFolder })
console.log('Database migrations applied')

const sessionSecret = process.env.SESSION_SECRET
const allowedEmails = (process.env.ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

if (!sessionSecret) {
  console.warn('WARNING: SESSION_SECRET is not set — the API is running WITHOUT authentication.')
}

const app = createApp(db, sessionSecret ? { auth: { sessionSecret, allowedEmails } } : {})
const port = Number(process.env.PORT) || 8081
app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
