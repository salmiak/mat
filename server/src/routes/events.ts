import { Router } from 'express'
import type { ChangeBus } from '../events.js'

const PING_INTERVAL_MS = 25_000 // keep proxies from closing the idle stream

// GET /api/events — server-sent events stream of ChangeEvents
export function eventsRouter (bus: ChangeBus): Router {
  const router = Router()

  router.get('/', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    })
    res.write('retry: 3000\n\n')

    const unsubscribe = bus.subscribe((event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    })
    const ping = setInterval(() => res.write(': ping\n\n'), PING_INTERVAL_MS)

    req.on('close', () => {
      clearInterval(ping)
      unsubscribe()
    })
  })

  return router
}
