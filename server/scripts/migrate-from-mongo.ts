/**
 * One-off data migration: MongoDB (old app) → PostgreSQL (new app).
 *
 * Usage:
 *   MONGODB_URI=mongodb+srv://... DATABASE_URL=postgres://... \
 *     npx tsx scripts/migrate-from-mongo.ts [--download-images]
 *
 * - Copies all recipes and meals, remapping meal→recipe references.
 * - With --download-images, recipe images are fetched from their old URLs
 *   (S3/CDN) and stored as blobs in the images table. Without it, the old
 *   URL is kept in legacy_image_url and keeps working as long as the old
 *   host is alive.
 * - Expects empty target tables; refuses to run otherwise.
 */
import { MongoClient, type Document } from 'mongodb'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { sql } from 'drizzle-orm'
import path from 'path'
import { createDb } from '../src/db/client.js'
import { images, mealRecipes, meals, recipes } from '../src/db/schema.js'

const mongoUri = process.env.MONGODB_URI
const pgUri = process.env.DATABASE_URL
if (!mongoUri || !pgUri) {
  console.error('Set both MONGODB_URI (source) and DATABASE_URL (target).')
  process.exit(1)
}
const downloadImages = process.argv.includes('--download-images')

const mongo = new MongoClient(mongoUri)
await mongo.connect()
const source = mongo.db()

const { db, pool } = createDb(pgUri)
await migrate(db, { migrationsFolder: path.join(import.meta.dirname, '..', 'drizzle') })

const [{ count }] = (await db.execute(sql`select count(*)::int as count from recipes`)).rows as [{ count: number }]
if (count > 0) {
  console.error('Target recipes table is not empty — aborting to avoid duplicates.')
  process.exit(1)
}

async function importImage (url: string, title: string): Promise<number | null> {
  try {
    const res = await fetch(url.startsWith('//') ? 'https:' + url : url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const [image] = await db.insert(images).values({
      data,
      contentType,
      filename: url.split('/').pop() ?? null
    }).returning({ id: images.id })
    return image.id
  } catch (err) {
    console.warn(`  ! Could not download image for "${title}" (${url}): ${(err as Error).message}`)
    return null
  }
}

// Recipes
const oldRecipes = await source.collection('recipes').find().toArray()
const recipeIdMap = new Map<string, number>()
for (const old of oldRecipes as Document[]) {
  const fileUrl: string | undefined = old.fileUrl || undefined
  let imageId: number | null = null
  if (fileUrl && downloadImages) {
    imageId = await importImage(fileUrl, old.title ?? '')
  }
  const [recipe] = await db.insert(recipes).values({
    title: old.title ?? '',
    comment: old.comment ?? '',
    url: old.url ?? '',
    imageId,
    legacyImageUrl: imageId == null ? (fileUrl ?? null) : null
  }).returning({ id: recipes.id })
  recipeIdMap.set(String(old._id), recipe.id)
}
console.log(`Migrated ${recipeIdMap.size} recipes`)

// Meals
const oldMeals = await source.collection('meals').find().toArray()
let mealCount = 0
let danglingRefs = 0
for (const old of oldMeals as Document[]) {
  const date = old.date ? new Date(old.date).toISOString().slice(0, 10) : null
  if (!date) {
    console.warn(`  ! Skipping meal without date: "${old.title}"`)
    continue
  }
  const [meal] = await db.insert(meals).values({
    title: old.title ?? '',
    comment: old.comment ?? '',
    date,
    index: old.index ?? 0,
    made: old.made ?? false
  }).returning({ id: meals.id })

  const refs: string[] = Array.isArray(old.recipes) ? old.recipes : []
  let position = 0
  for (const ref of refs) {
    const recipeId = recipeIdMap.get(String(ref))
    if (recipeId == null) {
      danglingRefs++
      continue
    }
    await db.insert(mealRecipes).values({ mealId: meal.id, recipeId, position: position++ })
  }
  mealCount++
}
console.log(`Migrated ${mealCount} meals (${danglingRefs} dangling recipe references skipped)`)

await mongo.close()
await pool.end()
console.log('Done.')
