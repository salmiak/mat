'use strict'
module.exports = {
  NODE_ENV: '"production"',
  // The client is served by the API server itself (same origin), so the
  // default API host is /. Override with the API_HOST env var at build time.
  API_HOST: JSON.stringify(process.env.API_HOST || '/')
}
