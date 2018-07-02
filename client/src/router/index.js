import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'

import ImportRecipes from '@/components/ImportRecipes'

import Week from '@/components/Week'

import Meals from '@/components/Meals'
import NewMeal from '@/components/NewMeal'

import Recipes from '@/components/Recipes'
import NewRecipe from '@/components/NewRecipe'

import Posts from '@/components/Posts'
import NewPost from '@/components/NewPost'
import EditPost from '@/components/EditPost'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },

    {
      path: '/import/recipes',
      name: 'ImportRecipes',
      component: ImportRecipes
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
    },

    {
      path: '/posts',
      name: 'Posts',
      component: Posts
    },
    {
      path: '/posts/new',
      name: 'NewPost',
      component: NewPost
    },
    {
      path: '/posts/:id',
      name: 'EditPost',
      component: EditPost
    }
  ]
})
