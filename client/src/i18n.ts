import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    Planning: 'Planning',
    Recipes: 'Recipes',
    Reload: 'Reload',
    Week: 'Week',
    'This week': 'This week',
    'Add Meal': 'Add Meal',
    'Add Recipe': 'Add Recipe',
    Cancel: 'Cancel',
    Save: 'Save',
    Title: 'Title',
    Comment: 'Comment',
    Url: 'Url',
    'Type to search': 'Type to search',
    Edit: 'Edit',
    'Not made': 'Not made',
    Made: 'Made',
    Copy: 'Copy',
    Move: 'Move',
    'Edit meal': 'Edit meal',
    'Edit recipe': 'Edit recipe',
    'Add meal': 'Add meal',
    'Create new recipe': 'Create new recipe',
    'Show more results': 'Show more',
    'No results': 'No results',
    Add: 'Add',
    Remove: 'Remove',
    'Type to search current recipes': 'Type to search current recipes',
    'Show more': 'Show more',
    'Show less': 'Show less',
    'Uploading image': 'Uploading image…',
    'Log in': 'Log in',
    'Log out': 'Log out',
    'Login intro': 'Sign in to see the meal planning.',
    'Account not allowed': 'This account does not have access.',
    'Login failed': 'Login failed. Try again.',
    'No login providers': 'No login method is configured.',
    'Image from link': 'This image is attached automatically when you save.',
    'Recipe with this link exists': 'A recipe with this link already exists: {title}. Saving will use it instead of creating a duplicate.',
    'Create recipe from link': 'Create a new recipe from the link'
  },
  se: {
    Planning: 'Planering',
    Recipes: 'Recept',
    Reload: 'Ladda om',
    Week: 'Vecka',
    'This week': 'Denna vecka',
    'Add Meal': 'Lägg till måltid',
    'Add Recipe': 'Lägg till recept',
    Cancel: 'Avbryt',
    Save: 'Spara',
    Title: 'Titel',
    Comment: 'Kommentar',
    Url: 'Url',
    'Type to search': 'Skriv för att söka',
    Edit: 'Redigera',
    'Not made': 'Ogjord',
    Made: 'Gjord',
    Copy: 'Kopiera',
    Move: 'Flytta',
    'Edit meal': 'Redigera måltid',
    'Edit recipe': 'Redigera recept',
    'Add meal': 'Skapa måltid',
    'Create new recipe': 'Skapa nytt recept',
    'Show more results': 'Visa fler',
    'No results': 'Inga träffar',
    Add: 'Lägg till',
    Remove: 'Ta bort',
    'Type to search current recipes': 'Sök för att lägga till befintligt recept',
    'Show more': 'Visa mer',
    'Show less': 'Visa mindre',
    'Uploading image': 'Laddar upp bild…',
    'Log in': 'Logga in',
    'Log out': 'Logga ut',
    'Login intro': 'Logga in för att se matplaneringen.',
    'Account not allowed': 'Det här kontot har inte åtkomst.',
    'Login failed': 'Inloggningen misslyckades. Försök igen.',
    'No login providers': 'Ingen inloggningsmetod är konfigurerad.',
    'Image from link': 'Bilden läggs till automatiskt när du sparar.',
    'Recipe with this link exists': 'Det finns redan ett recept med den här länken: {title}. Sparar du används det istället för att skapa en dublett.',
    'Create recipe from link': 'Skapa nytt recept från länken'
  }
}

export type Locale = keyof typeof messages

const STORAGE_KEY = 'mat.locale'

export function savedLocale (): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'se') return saved
  } catch { /* private browsing etc. */ }
  return 'se'
}

export function persistLocale (locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch { /* ignore */ }
}

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale(),
  fallbackLocale: 'se',
  missingWarn: false,
  fallbackWarn: false,
  messages
})
