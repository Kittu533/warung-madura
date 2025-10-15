import { useAuthStore } from '@/stores/auth.store'

export function authGuard(to) {
  const auth = useAuthStore()

  if (to.meta?.requiresAuth && !auth.isAuthenticated) {
    return { name: 'auth-login', query: { redirect: to.fullPath } }
  }
  if (to.meta?.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
  return true
}
