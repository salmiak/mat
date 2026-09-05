export interface Meal {
  id: number
  title: string
  comment: string
  /** YYYY-MM-DD */
  date: string
  index: number
  made: boolean
  recipeIds: number[]
}

export type NewMeal = Omit<Meal, 'id'> & { id?: number }

export interface Recipe {
  id: number
  title: string
  comment: string
  url: string
  imageUrl: string | null
}

export type NewRecipe = Omit<Recipe, 'id'> & { id?: number }

export interface WeekRef {
  week: number
  year: number
}
