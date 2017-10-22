import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import RecipeList from '@/components/RecipeList'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/week'
    },
    {
      path: '/week',
      name: 'Home',
      component: Home
    },
    {
      path: '/week/:year/:week',
      name: 'Week',
      component: Home
    },
    {
      path: '/recipes',
      name: 'Recipes',
      component: RecipeList
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
  ]
})
