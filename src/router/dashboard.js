export default [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/categories/index',
    name: 'dashboard-categories',
    component: () => import('@/views/dashboard/categories/index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/product/index',
    name: 'dashboard-product',
    component: () => import('@/views/dashboard/product/index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/cart',
    name: 'dashboard-cart',
    component: () => import('@/views/dashboard/cart/index.vue'),
    meta: { requiresAuth: true },
  }
]