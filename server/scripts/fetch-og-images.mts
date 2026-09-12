// One-off: fetch og:images for existing link recipes without an image.
//   DATABASE_URL=postgres://... npx tsx scripts/fetch-og-images.mts
import { isNull, and, isNotNull, ne } from 'drizzle-orm'
import { createDb } from '../src/db/client.js'
import { recipes } from '../src/db/schema.js'
import { attachOgImage } from '../src/ogImage.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('Set DATABASE_URL')
  process.exit(1)
}
const { db, pool } = createDb(connectionString)

const candidates = await db.select({ id: recipes.id, title: recipes.title, url: recipes.url })
  .from(recipes)
  .where(and(isNull(recipes.imageId), isNull(recipes.legacyImageUrl), isNotNull(recipes.url), ne(recipes.url, '')))

console.log(`${candidates.length} link recipes without an image`)
for (const recipe of candidates) {
  await attachOgImage(db, undefined, recipe.id)
  console.log(`- ${recipe.title} (${recipe.url})`)
}
console.log('Done')
await pool.end()
