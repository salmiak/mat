import Vue from 'vue'
import Router from 'vue-router'

import auth from '@/auth'
import Login from '@/components/Login.vue'

import ImportRecipes from '@/components/ImportRecipes'
import ImportMeals from '@/components/ImportMeals'

import Week from '@/components/Week'

import Meals from '@/components/Meals'
import NewMeal from '@/components/NewMeal'

import Recipes from '@/components/Recipes'
import NewRecipe from '@/components/NewRecipe'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      component: Login
    },
    {
      path: '/logout',
      beforeEnter (to, from, next) {
        auth.logout()
        next('/login')
      }
    },

    {
      path: '/',
      name: 'Start page',
      component: Week,
      beforeEnter: requireAuth
    },

    {
      path: '/import/recipes',
      name: 'ImportRecipes',
      component: ImportRecipes,
      beforeEnter: requireAuth
    },
    {
      path: '/import/meals',
      name: 'ImportMeals',
      component: ImportMeals,
      beforeEnter: requireAuth
    },

    {
      path: '/week/:year/:week',
      name: 'Week',
      component: Week,
      beforeEnter: requireAuth
    },
    {
      path: '/week',
      name: 'Current Week',
      component: Week,
      beforeEnter: requireAuth
    },

    {
      path: '/meals',
      name: 'Meals',
      component: Meals,
      beforeEnter: requireAuth
    },
    {
      path: '/meals/new',
      name: 'NewMeal',
      component: NewMeal,
      beforeEnter: requireAuth
    },

    {
      path: '/recipes',
      name: 'Recipes',
      component: Recipes,
      beforeEnter: requireAuth
    },
    {
      path: '/recipes/new',
      name: 'NewRecipe',
      component: NewRecipe,
      beforeEnter: requireAuth
    }
  ]
})

function requireAuth (to, from, next) {
  if (!auth.loggedIn()) {
    next({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  } else {
    next()
  }
}
