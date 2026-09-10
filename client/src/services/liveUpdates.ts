import { useMealsStore } from '@/stores/meals'
import { useRecipesStore } from '@/stores/recipes'
import type { ChangeEvent } from '@/types'

// Applies a change broadcast by the server to the local stores. Events for
// changes made in this browser arrive too — applying them is a no-op since
// the payload matches what the store already holds.
export function applyChangeEvent (event: ChangeEvent) {
  if (event.resource === 'meals') {
    const meals = useMealsStore()
    if (event.action === 'saved') meals.setMeal(event.meal)
    else if (event.action === 'deleted') meals.removeMeal(event.id)
    else if (event.action === 'voted') meals.applyVoteTally(event.id, event.upvotes, event.downvotes)
  } else if (event.resource === 'recipes') {
    const recipes = useRecipesStore()
    if (event.action === 'saved') recipes.setRecipe(event.recipe)
    else if (event.action === 'deleted') recipes.removeRecipe(event.id)
  }
}

let source: EventSource | null = null
let dropped = false

export function connectLiveUpdates () {
  if (source) return
  source = new EventSource('/api/events')
  source.onmessage = (e) => {
    applyChangeEvent(JSON.parse(e.data) as ChangeEvent)
  }
  source.onerror = () => {
    // EventSource reconnects on its own; remember the gap so we can resync
    dropped = true
  }
  source.onopen = () => {
    if (!dropped) return
    dropped = false
    // Changes broadcast during the gap were missed — refetch what we show
    useMealsStore().reloadLoadedWeeks()
    useRecipesStore().loadRecipeList(true)
  }
}

export function disconnectLiveUpdates () {
  source?.close()
  source = null
  dropped = false
}
