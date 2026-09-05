'use strict'
module.exports = {
  NODE_ENV: '"production"',
  // Override with API_HOST env var at build time (e.g. API_HOST=/ when the
  // client is served by the API server itself, as on Railway).
  API_HOST: JSON.stringify(process.env.API_HOST || 'https://w5sv2j9xl8.execute-api.eu-west-1.amazonaws.com/dev/')
}
