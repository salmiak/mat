import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import RecipeList from '@/components/RecipeList'
import Desktop from '@/components/Desktop'

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
      path: '/desktop',
      name: 'Desktop',
      component: Desktop
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
  ]
})
