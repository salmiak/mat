import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import Mobile from '@/components/Mobile'
import RecipeList from '@/components/RecipeList'
import Desktop from '@/components/Desktop'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/m/week',
      name: 'This week',
      component: Mobile
    },
    {
      path: 'm/week/:year/:week',
      name: 'Week',
      component: Mobile
    },
    {
      path: '/recipes',
      name: 'Recipes',
      component: RecipeList
    },
    {
      path: '/d',
      name: 'Overview',
      component: Desktop
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
  ]
})
