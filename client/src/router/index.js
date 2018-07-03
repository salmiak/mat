import Vue from 'vue'
import Router from 'vue-router'

import Auth from '@okta/okta-vue'

import ImportRecipes from '@/components/ImportRecipes'
import ImportMeals from '@/components/ImportMeals'

import Welcome from '@/components/Welcome'

import Week from '@/components/Week'

import Meals from '@/components/Meals'
import NewMeal from '@/components/NewMeal'

import Recipes from '@/components/Recipes'
import NewRecipe from '@/components/NewRecipe'

Vue.use(Router)

Vue.use(Auth, {
  issuer: 'https://dev-633272.oktapreview.com/oauth2/default',
  client_id: '0oafngul4tDd4FKLX0h7',
  redirect_uri: 'http://localhost:8080/implicit/callback',
  scope: 'openid profile email'
})

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/implicit/callback',
      component: Auth.handleCallback()
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
