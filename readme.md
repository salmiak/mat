# Beckmans Matplanering

Familjens app för veckovis matplanering: planera måltider per vecka och koppla recept (länkar eller uppladdade bilder) till varje måltid.

**Stack:** Vue 3 + Vite + Pinia + TypeScript (klient), Express 5 + Drizzle ORM + PostgreSQL (server). Bilder lagras som blobs i Postgres. Allt körs på Railway. Se `docs/architecture.md` för detaljer.

## Utveckling

Kräver Node 22+ och en Postgres att peka på (`DATABASE_URL`).

```bash
# Servern (API på :8081, kör migreringar vid start)
cd server && npm install
DATABASE_URL=postgres://... npm run dev

# Klienten (Vite dev-server på :8080, proxar /api till :8081)
cd client && npm install
npm run dev
```

**Tester:** `npm test` i `server/` (vitest + supertest mot in-memory-Postgres via pg-mem) respektive `client/` (vitest, stores + komponenter). Eller `npm test` i repo-roten för båda.

## Deploy på Railway

En Railway-tjänst kör Express-servern som serverar API, byggd klient och bilder. Databasen är en Postgres-tjänst i samma projekt.

1. Skapa ett Railway-projekt från repot. `railway.json` får Nixpacks att köra `npm run build` (bygger klient + server) och `npm start`.
2. Lägg till en **PostgreSQL**-tjänst i projektet.
3. Sätt `DATABASE_URL` = `${{ Postgres.DATABASE_URL }}` på apptjänsten.
4. Generera en publik domän under tjänstens Settings → Networking. Servern kör sina databasmigreringar automatiskt vid varje deploy.

Ingen volym och inga AWS-beroenden behövs.

## Migrera data från gamla appen (Mongo)

Engångsjobb när du vill flytta innehållet:

```bash
cd server
MONGODB_URI=mongodb+srv://... DATABASE_URL=postgres://... npm run migrate:mongo -- --download-images
```

`--download-images` hämtar receptbilderna från de gamla S3-URL:erna och lagrar dem som blobs; utan flaggan behålls de gamla URL:erna (fungerar så länge S3-bucketen finns kvar).

## Todo
- Rate recipes
- Smarter meal creation
  - When writing title for new meal, automatically search for matching recipes and have an "add new recipe" button that opens the recipe editor with the title prefilled.
- User management and authentication
- Real-time updates (multiple users working at the same time)
