import { createRouter, createWebHistory } from 'vue-router'
import WeekView from '@/components/WeekView.vue'
import RecipesView from '@/components/RecipesView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/week' },
    { path: '/week', name: 'CurrentWeek', component: WeekView },
    { path: '/week/:year/:week', name: 'Week', component: WeekView },
    { path: '/recipes', name: 'Recipes', component: RecipesView },
    { path: '/:pathMatch(.*)*', redirect: '/week' }
  ]
})

export default router
