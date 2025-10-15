import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import authRoutes from './auth'
import dashboardRoutes from './dashboard'

const routes = [
  ...authRoutes,
  {
    path: '/',
    name: 'root',
    redirect: '/dashboard', // default ke dashboard
    meta: { requiresAuth: true },
  },
  ...dashboardRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Jika butuh login tapi belum login
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'auth-login' })
  }

  // Jika sudah login tapi ke halaman login lagi
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router