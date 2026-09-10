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

## Inloggning

Inloggning sker med Google (Apple ID förberett men kräver Apple Developer-konto) och en allowlist av e-postadresser. Servern verifierar Googles ID-token mot deras JWKS och sätter en HMAC-signerad sessionscookie (30 dagar, HttpOnly). Utan `SESSION_SECRET` körs API:t helt öppet — bara för lokal utveckling.

1. Skapa ett OAuth 2.0 Web Client ID i [Google Cloud Console](https://console.cloud.google.com/apis/credentials) och lägg sajtens origin under *Authorized JavaScript origins* (för lokal utveckling: `http://localhost:8080`).
2. Sätt env-vars på apptjänsten (se `.env.example`): `SESSION_SECRET`, `ALLOWED_EMAILS` (kommaseparerad) och `GOOGLE_CLIENT_ID`.
3. För Apple-inloggning senare: sätt `APPLE_CLIENT_ID` (Services ID) — serversidan är redan på plats.

## MCP-server: planera måltider med Claude

`mcp/` innehåller en MCP-server som låter Claude läsa recepten och skapa/redigera måltider via sajtens API — spåna fram en veckoplan i chatten och få den inmatad automatiskt. Verktyg: `list_recipes`, `create_recipe`, `update_recipe` (kan ladda upp en lokal bildfil), `get_week`, `create_meal`, `update_meal`, `delete_meal`.

1. Generera en token (`openssl rand -hex 32`) och lägg den i `API_TOKENS` på Railway-tjänsten.
2. `cd mcp && npm install`
3. Registrera i Claude Code:

```bash
claude mcp add --scope user mat \
  --env MAT_API_URL=https://<din-domän> \
  --env MAT_API_TOKEN=<token> \
  -- node /absolut/sökväg/till/mat/mcp/index.mjs
```

I Claude Desktop: motsvarande post under Settings → Developer → MCP servers.

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
  - Done: Google sign-in with email allowlist; Apple prepared (needs Apple Developer account + `APPLE_CLIENT_ID` + a login button)
- Real-time updates (multiple users working at the same time)
