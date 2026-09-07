import { createRouter, createWebHistory } from 'vue-router'
import WeekView from '@/components/WeekView.vue'
import RecipesView from '@/components/RecipesView.vue'
import LoginView from '@/components/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/week' },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/week', name: 'CurrentWeek', component: WeekView },
    { path: '/week/:year/:week', name: 'Week', component: WeekView },
    { path: '/recipes', name: 'Recipes', component: RecipesView },
    { path: '/:pathMatch(.*)*', redirect: '/week' }
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.ensureChecked()
  if (!auth.authRequired || auth.loggedIn) {
    return to.name === 'Login' ? '/week' : true
  }
  return to.name === 'Login' ? true : { name: 'Login' }
})

export default router
