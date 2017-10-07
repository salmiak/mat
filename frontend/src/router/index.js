import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import RecipeList from '@/components/RecipeList'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/week',
      alias: '/',
      name: 'Week',
      component: Home
    },
    {
      path: '/week/:week',
      name: 'Week',
      component: Home
    },
    {
      path: '/recipes',
      name: 'Recipes',
      component: RecipeList
    },
  ]
})
