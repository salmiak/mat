import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'

import ImportRecipes from '@/components/ImportRecipes'
import ImportMeals from '@/components/ImportMeals'

import Week from '@/components/Week'

import Meals from '@/components/Meals'
import NewMeal from '@/components/NewMeal'

import Recipes from '@/components/Recipes'
import NewRecipe from '@/components/NewRecipe'

Vue.use(Router)
Vue.use(Meta)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Week
    },
    {
      path: '/import/recipes',
      name: 'ImportRecipes',
      component: ImportRecipes
    },
    {
      path: '/import/meals',
      name: 'ImportMeals',
      component: ImportMeals
    },

    {
      path: '/week/:year/:week',
      name: 'Week',
      component: Week
    },
    {
      path: '/week',
      name: 'Current Week',
      component: Week
    },

    {
      path: '/meals',
      name: 'Meals',
      component: Meals
    },
    {
      path: '/meals/new',
      name: 'NewMeal',
      component: NewMeal
    },

    {
      path: '/recipes',
      name: 'Recipes',
      component: Recipes
    },
    {
      path: '/recipes/new',
      name: 'NewRecipe',
      component: NewRecipe
    }
  ]
})

export default router
