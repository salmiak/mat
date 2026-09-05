# Beckmans Matplanering — arkitektur

En familjeapp för veckovis matplanering: man planerar måltider per vecka och kopplar recept (länkar eller uppladdade bilder) till varje måltid.

## Översikt

```
┌─────────────────────────── Railway-tjänst ───────────────────────────┐
│  Express-server (server/)                                            │
│  ├── REST-API:  /meals  /recipes  /requestUploadURL  /uploads        │
│  ├── Statiska filer: byggd Vue-klient (client/dist)                  │
│  └── Uppladdade bilder: UPLOAD_DIR (Railway-volym)                   │
└──────────────────────────────────────────────────────────────────────┘
                     │ mongoose
                     ▼
             MongoDB (MONGODB_URI)
```

## Datamodell (server/models/)

**Meal** — en planerad måltid: `title`, `comment`, `date`, `index` (sorteringsordning inom dagen), `made` (bockas av när den lagats), `recipes` (array av Recipe-id:n som strängar), `wpId` (rest från en gammal WordPress-import), timestamps.

**Recipe** — ett recept: `title`, `comment` (markdown), `url` (länk till externt recept), `fileUrl` (uppladdad bild), `wpId`, timestamps.

Relationen Meal→Recipe är löst kopplad: `meal.recipes` innehåller id-strängar, ingen referentiell integritet.

## Server (server/)

- `index.js` → kräver `app.js`, som gör allt: ansluter till Mongo (env `MONGODB_URI`), definierar alla routes inline, och börjar lyssna först när DB-anslutningen är öppen.
- REST-endpoints: CRUD för `/meals` (GET stödjer `?week=&year=`-filter på ISO-vecka) och `/recipes`. Callback-baserad mongoose 5-stil.
- Uppladdning: `POST /requestUploadURL` returnerar en same-origin-URL; klienten `PUT`:ar filens råa bytes till `/uploads/:name`; filer lagras i `UPLOAD_DIR` och serveras statiskt under `/uploads/`.
- `GET /cloneProd2Dev` klonar produktions-DB till dev-DB (endast `NODE_ENV=dev`).
- Servern serverar också den byggda klienten från `client/dist` med SPA-fallback (vue-router history mode).

## Klient (client/)

Vue 2.5 SPA byggd med vue-cli-webpack-mallen från 2018 (webpack 3, babel 6).

- **Routing** (`src/router/`): `/week/:year?/:week?` (huvudvyn), `/meals`, `/recipes`, `/import/*` (engångsimport från WordPress-XML), `/uploadtest`.
- **State** (`src/store/`): Vuex med två namespaced-moduler:
  - `meals` — lista + `mealsInWeek`-getter (filtrerar på ISO-vecka), CRUD-actions.
  - `recipes` — lista med 5-minuters klientcache (`syncTimestamp`), CRUD-actions.
- **API-lager** (`src/services/`): tunn axios-wrapper (`Api.js`, baseURL från byggtidens `API_HOST`, default `/`) + `MealsService`/`RecipesService`.
- **Huvudkomponenter**: `Week.vue` (veckovy med föregående/nästa-navigering), `Meal.vue` (måltidskort med swipe-actions: gjord/redigera/ta bort), `EditMeal.vue` (redigering + receptsök med fuzzy-sök via vue-fuse och koppling av recept), `Recipes.vue`/`Recipe.vue`/`EditRecipe.vue` (receptbibliotek), `Upload.vue` (bilduppladdning), `SwipeActionItem.vue`, `SureButton.vue` (bekräfta-knapp), `Expander.vue`.
- **i18n**: vue-i18n med svenska (default) och engelska, delvis per-komponent via `<i18n>`-block. Språkval sparas i cookie.
- Mobilanpassad (vue-touch/hammer.js för swipe-gester).

## Tester

- **Server** (`server/test/`): vitest + supertest. Mongoose-modellerna mockas (ingen riktig DB) och HTTP-lagret testas: veckofiltrering, fältwhitelisting, uppladdningsflödet inkl. path traversal-skydd. `npm test` i `server/`.
- **Klient** (`client/test/unit/specs/`): vitest mot Vuex-modulerna (getters, mutations, actions med mockade services). `npm run unit` i `client/`. Komponenttester är inte möjliga med rimlig insats på Vue 2.5-toolchainen — de tillkommer i och med Vue 3-migreringen.
- CI: `.github/workflows/ci.yml` kör båda testsviterna + produktionsbygget.

## Deploy

En Railway-tjänst (se `railway.json` och readme): Nixpacks kör `npm run build` (klientbygge + serverinstall) och `npm start`. MongoDB som Railway-tjänst, bilder på en Railway-volym. Inga AWS-beroenden.
