# Beckmans Matplanering — arkitektur

En familjeapp för veckovis matplanering: man planerar måltider per vecka och kopplar recept (länkar eller uppladdade bilder) till varje måltid.

## Översikt

```
┌─────────────────────────── Railway-tjänst ───────────────────────────┐
│  Express 5-server (server/, TypeScript)                              │
│  ├── REST-API:  /api/meals  /api/recipes  /api/images  /api/health   │
│  └── Statiska filer: byggd Vue 3-klient (client/dist) + SPA-fallback │
└──────────────────────────────────────────────────────────────────────┘
                     │ Drizzle ORM (node-postgres)
                     ▼
        PostgreSQL (Railway-tjänst, DATABASE_URL)
        — inkl. bilder som bytea-blobs i images-tabellen
```

## Datamodell (server/src/db/schema.ts)

- **meals** — `id`, `title`, `comment`, `date` (DATE), `index` (sorteringsordning inom dagen), `made`, timestamps.
- **recipes** — `id`, `title`, `comment` (markdown), `url` (extern receptlänk), `image_id` (FK → images), `legacy_image_url` (gamla S3-URL:er tills datamigreringen körts), timestamps.
- **meal_recipes** — junction-tabell (meal_id, recipe_id, position) med cascade-delete åt båda håll.
- **images** — `id`, `data` (bytea), `content_type`, `filename`. Bilder är immutabla (ny uppladdning = nytt id) och serveras med `Cache-Control: immutable`.

Schemat versioneras med Drizzle-migreringar i `server/drizzle/` (genereras med `npm run db:generate`) och appliceras automatiskt när servern startar.

## API

- `GET /api/meals?week=&year=` — måltider, valfritt filtrerade på ISO-vecka; sorterade datum fallande, index stigande. Varje måltid har `recipeIds: number[]`.
- `POST/PUT/DELETE /api/meals(/:id)` — payload `{title, comment, date, index, made, recipeIds}`.
- `GET/POST/PUT/DELETE /api/recipes(/:id)` — payload `{title, comment, url, imageUrl}`. `imageUrl` är antingen `/api/images/:id` (uppladdad) eller en extern legacy-URL; servern lagrar rätt kolumn.
- `POST /api/images` — råa bildbytes (content-type `image/*`, max 15 MB) → `{id, url}`. `GET /api/images/:id` serverar bilden.

## Klient (client/)

Vue 3 + Vite + TypeScript.

- **Routing** (`src/router.ts`): `/week`, `/week/:year/:week`, `/recipes`; history mode med SPA-fallback på servern.
- **State** (`src/stores/`): Pinia — `meals` (lista + `mealsInWeek`-getter på ISO-vecka) och `recipes` (5 min klientcache via `syncTimestamp`).
- **API-lager** (`src/services/api.ts`): tunn fetch-wrapper mot `/api` (Vite-proxy i dev).
- **Komponenter**: `WeekView` (veckovy med navigering), `MealCard` (swipe-actions: gjord/flytta/kopiera/redigera), `EditMeal` (fuzzy-receptsök med fuse.js, skapa nya recept inline), `RecipesView`/`RecipeCard`/`RecipeContent`/`EditRecipe`, `ImageUpload`, `SwipeActionItem` (pointer events, ersätter hammer.js), `SureButton` (klicka två gånger för att bekräfta), `ExpanderBox`, `MarkdownText` (markdown-it), `GrowingTextarea`.
- **i18n**: vue-i18n med svenska (default) och engelska i `src/i18n.ts`; språkval i localStorage.
- Datumlogik med date-fns (ISO-veckor), ersätter moment.

## Tester

- **Server** (`server/test/`): vitest + supertest mot en in-memory-Postgres (pg-mem) med de riktiga migreringarna applicerade — hela HTTP→DB-kedjan testas utan extern databas.
- **Klient** (`client/test/`): vitest + happy-dom; Pinia-stores med mockat API-lager samt komponenttester (@vue/test-utils).
- CI: `.github/workflows/ci.yml` kör test + build för båda.

## Deploy

En Railway-tjänst (se `railway.json`): Nixpacks kör `npm run build` (klient + server) och `npm start` (`node dist/index.js` som kör migreringar och lyssnar på `PORT`). Postgres som Railway-tjänst via `DATABASE_URL`. Inga volymer, inga AWS-beroenden.

## Datamigrering från gamla appen

`server/scripts/migrate-from-mongo.ts` flyttar recepten och måltiderna från den gamla MongoDB-databasen (se readme). Skriptet är oprövat mot riktig data — kör det mot en tom Postgres och verifiera innan gamla databasen stängs ner.

## Framtida features (förberett för)

- **Auth/users**: lägg en `users`-tabell + session-cookies; allt går redan genom en app-fabrik (`createApp`) så middleware är enkel att lägga till.
- **Realtid**: socket.io i samma Express-process; Pinia-stores har `setMeal`/`setRecipe` som är naturliga mottagare för server-pushade uppdateringar.
