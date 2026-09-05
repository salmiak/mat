# Beckmans Matplanering

## Setup

You need to install [node.js](https://nodejs.org/en/)

Database connection strings are no longer hardcoded — copy `.env.example` and set `MONGODB_URI` (and optionally `MONGODB_URI_DEV` / `MONGODB_URI_PROD`) in your environment before starting the server.

### Client
**Run dev:** `npm run start`

### Server
**Run dev:** `MONGODB_URI_DEV=<your-dev-uri> npm run start`

## Deploy on Railway

Everything runs on Railway — no AWS dependency. One service runs the Express server, which serves the API, the built Vue client (same origin, so the client is built with `API_HOST=/`), and uploaded files. The database is a MongoDB service in the same Railway project, and uploads are stored on a Railway volume.

1. Create a new Railway project from this repo. `railway.json` makes Nixpacks run `npm run build` (installs client deps, builds the client into `client/dist`, installs server deps) and start with `npm start` (`node server/index.js`).
2. Add a **MongoDB** database service to the project (Railway's MongoDB template).
3. On the app service, set variables:
   - `MONGODB_URI` = `${{ MongoDB.MONGO_URL }}` (reference to the MongoDB service), or your own MongoDB URI.
   - `UPLOAD_DIR` = the volume mount path, e.g. `/data/uploads`.
4. Attach a **volume** to the app service (right-click the service → Attach volume) mounted at e.g. `/data`. Uploaded recipe images are stored there and served by the server under `/uploads/`.
5. Generate a public domain under the service's Settings → Networking. Railway injects `PORT` automatically; the server binds to it.

## Clone production db to dev db

Start the server and visit http://localhost:8081/cloneProd2Dev

This will drop the content in dev database and replace it with the content in the production database.


## Todo
- Refactor expanding-textarea to it's own component
- Refactor New Recipes list to it's own component
- Rate recipes
- Upload image when adding recipe from new meal
- Smarter meal creation
  - When writing title for new meal, automaticaly search for matching recipes and have a "add new recipe"-button that opens new recipe-editor with title prefilled.
- https://auth0.com/
