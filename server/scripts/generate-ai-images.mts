// Generate AI images for recipes that have no image at all (og:image
// fetching failed or there is no link). Costs money per image — run with
// a limit and raise it when the results look good:
//   DATABASE_URL=postgres://... GEMINI_API_KEY=... npx tsx scripts/generate-ai-images.mts --limit 3
import { isNull, and } from 'drizzle-orm'
import { createDb } from '../src/db/client.js'
import { recipes } from '../src/db/schema.js'
import { attachAiImage } from '../src/aiImage.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString || !process.env.GEMINI_API_KEY) {
  console.error('Set DATABASE_URL and GEMINI_API_KEY')
  process.exit(1)
}
const limitArg = process.argv.indexOf('--limit')
const limit = limitArg !== -1 ? Number(process.argv[limitArg + 1]) : 3

const { db, pool } = createDb(connectionString)

const candidates = await db.select({ id: recipes.id, title: recipes.title })
  .from(recipes)
  .where(and(isNull(recipes.imageId), isNull(recipes.legacyImageUrl)))
  .limit(limit)

console.log(`Generating images for ${candidates.length} recipes (limit ${limit})`)
for (const recipe of candidates) {
  await attachAiImage(db, undefined, recipe.id)
  console.log(`- ${recipe.title}`)
}
console.log('Done')
await pool.end()
