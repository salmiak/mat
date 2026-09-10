import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { setUnauthorizedHandler } from './services/api'
import { connectLiveUpdates, disconnectLiveUpdates } from './services/liveUpdates'
import { useAuthStore } from './stores/auth'
import { watchEffect } from 'vue'

const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(router)
  .use(i18n)
  .mount('#app')

// An expired session surfaces as a 401 on any data call: drop the stale
// user and show the login page.
setUnauthorizedHandler(() => {
  useAuthStore(pinia).sessionExpired()
  router.push({ name: 'Login' })
})

// Live updates from other users, whenever we have (or need no) session
const auth = useAuthStore(pinia)
watchEffect(() => {
  if (auth.checked && (auth.loggedIn || !auth.authRequired)) {
    connectLiveUpdates()
  } else {
    disconnectLiveUpdates()
  }
})
