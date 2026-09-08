export interface Meal {
  id: number
  title: string
  comment: string
  /** YYYY-MM-DD */
  date: string
  index: number
  made: boolean
  recipeIds: number[]
  upvotes: number
  downvotes: number
}

export type VoteValue = 1 | -1

export type NewMeal = Omit<Meal, 'id' | 'upvotes' | 'downvotes'> & {
  id?: number
  upvotes?: number
  downvotes?: number
}

export interface Recipe {
  id: number
  title: string
  comment: string
  url: string
  imageUrl: string | null
  /** Downscaled version of imageUrl for lists (falls back to imageUrl) */
  thumbUrl?: string | null
  /** Sum of thumb votes on meals this recipe belongs to */
  score?: number
}

export type NewRecipe = Omit<Recipe, 'id'> & { id?: number }

export interface WeekRef {
  week: number
  year: number
}

export interface AuthUser {
  id: number
  email: string
  name: string
  picture: string
}

export interface AuthProvider {
  name: string
  clientId: string
}

export interface MeResponse {
  user: AuthUser | null
  providers: AuthProvider[]
  authRequired: boolean
}
