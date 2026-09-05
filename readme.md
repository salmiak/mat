# Beckmans Matplanering

## Setup

You need to install [node.js](https://nodejs.org/en/)

Database connection strings are no longer hardcoded — copy `.env.example` and set `MONGODB_URI` (and optionally `MONGODB_URI_DEV` / `MONGODB_URI_PROD`) in your environment before starting the server.

### Client
**Run dev:** `npm run start`

### Server
**Run dev:** `MONGODB_URI_DEV=<your-dev-uri> npm run start`

## Deploy on Railway

The app runs as a single Railway service: the Express server serves both the API and the built Vue client (same origin, so the client is built with `API_HOST=/`).

1. Create a new Railway project from this repo. `railway.json` makes Nixpacks run `npm run build` (installs client deps, builds the client into `client/dist`, installs server deps) and start with `npm start` (`node server/index.js`).
2. Set variables on the service:
   - `MONGODB_URI` — your MongoDB Atlas connection string (or `${{ MongoDB.MONGO_URL }}` if you add Railway's MongoDB service).
   - Optional, for image uploads via S3: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_UPLOAD_BUCKET`.
3. Generate a public domain under the service's Settings → Networking. Railway injects `PORT` automatically; the server binds to it.

### Legacy AWS deploy

The old AWS setup (client on S3, server on Lambda via Serverless) still works:

- Client: `npm run deploy` in `client/` (builds with the AWS API Gateway `API_HOST` default and syncs to S3).
- Server: `npm run deploy` in `server/` (requires `serverless` installed and AWS credentials configured).

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
