import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import authRoutes from './auth'
import dashboardRoutes from './dashboard'

const routes = [
  ...authRoutes,
  {
    path: '/',
    name: 'root',
    redirect: '/dashboard', 
    meta: { requiresAuth: true },
  },
  ...dashboardRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/errors/not-found.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'auth-login' })
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router