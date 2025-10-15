export default [
  {
    path: '/auth/login',
    name: 'auth-login',
    component: () => import('@/views/auth/login/index.vue'),
    meta: { guestOnly: true },
  }
]
 