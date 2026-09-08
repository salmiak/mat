import { boolean, customType, date, integer, pgTable, primaryKey, serial, text, timestamp } from 'drizzle-orm/pg-core'

// Sent as a hex literal so the value survives every driver (node-postgres
// casts it server-side; pg-mem would mangle a raw Buffer).
const bytea = customType<{ data: Buffer, driverData: unknown }>({
  dataType () {
    return 'bytea'
  },
  toDriver (value: Buffer): string {
    return '\\x' + value.toString('hex')
  },
  fromDriver (value: unknown): Buffer {
    if (Buffer.isBuffer(value)) {
      // pg-mem (used in tests) stores the hex literal verbatim; real Postgres
      // decodes it server-side. No image format starts with a literal "\x",
      // so decoding here is unambiguous.
      if (value.length > 2 && value[0] === 0x5c && value[1] === 0x78 && value.length % 2 === 0) {
        const hex = value.subarray(2).toString('ascii')
        if (/^[0-9a-f]+$/i.test(hex)) return Buffer.from(hex, 'hex')
      }
      return value
    }
    if (typeof value === 'string' && value.startsWith('\\x')) {
      return Buffer.from(value.slice(2), 'hex')
    }
    throw new Error('Unexpected bytea value from driver')
  }
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull().default(''),
  picture: text('picture').notNull().default(''),
  // OIDC provider ('google' | 'apple') and its stable subject claim. The
  // account key is the verified email, so one row can serve both providers;
  // these record how the user last signed in.
  provider: text('provider').notNull(),
  providerSub: text('provider_sub').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }).defaultNow().notNull()
})

export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  data: bytea('data').notNull(),
  contentType: text('content_type').notNull(),
  filename: text('filename'),
  // Downscaled version for list thumbnails; generated at upload, or lazily
  // on first request for images that predate thumbnails
  thumbData: bytea('thumb_data'),
  thumbContentType: text('thumb_content_type'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull().default(''),
  comment: text('comment').notNull().default(''),
  url: text('url').notNull().default(''),
  imageId: integer('image_id').references(() => images.id),
  // Old S3/volume URLs kept verbatim until the data migration pulls the
  // files into the images table.
  legacyImageUrl: text('legacy_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  title: text('title').notNull().default(''),
  comment: text('comment').notNull().default(''),
  date: date('date').notNull(),
  index: integer('index').notNull().default(0),
  made: boolean('made').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

// Thumbs up/down on a meal. Anonymous for now — user_id comes with auth.
// A recipe's score is the sum of votes on the meals it belongs to.
export const mealVotes = pgTable('meal_votes', {
  id: serial('id').primaryKey(),
  mealId: integer('meal_id').notNull().references(() => meals.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(), // +1 or -1
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const mealRecipes = pgTable('meal_recipes', {
  mealId: integer('meal_id').notNull().references(() => meals.id, { onDelete: 'cascade' }),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0)
}, (t) => [
  primaryKey({ columns: [t.mealId, t.recipeId] })
])
