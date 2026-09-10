import { EventEmitter } from 'node:events'
import type { serializeMeal } from './routes/meals.js'
import type { serializeRecipe } from './routes/recipes.js'

// Change notifications broadcast to every connected client over SSE.
// Payloads are the same serialized shapes the REST responses use, so a
// client can apply them to its stores directly.
export type ChangeEvent =
  | { resource: 'meals', action: 'saved', meal: ReturnType<typeof serializeMeal> }
  | { resource: 'meals', action: 'deleted', id: number }
  | { resource: 'meals', action: 'voted', id: number, upvotes: number, downvotes: number }
  | { resource: 'recipes', action: 'saved', recipe: ReturnType<typeof serializeRecipe> }
  | { resource: 'recipes', action: 'deleted', id: number }

export class ChangeBus {
  private emitter = new EventEmitter()

  constructor () {
    // One listener per connected client
    this.emitter.setMaxListeners(0)
  }

  publish (event: ChangeEvent) {
    this.emitter.emit('change', event)
  }

  subscribe (listener: (event: ChangeEvent) => void): () => void {
    this.emitter.on('change', listener)
    return () => this.emitter.off('change', listener)
  }
}
