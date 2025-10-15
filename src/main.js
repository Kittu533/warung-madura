import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// >>> pasang guard SETELAH pinia aktif
import { useAuthStore } from '@/stores/auth.store'
router.beforeEach((to) => {
  const auth = useAuthStore()
  // kalau kamu punya init() untuk inject token provider, panggil sekali di sini
  auth.init?.()

  if (to.meta?.requiresAuth && !auth.isAuthenticated) {
    return { name: 'auth-login', query: { redirect: to.fullPath } }
  }
  if (to.meta?.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
  return true
})

app.use(router)
app.mount('#app')
