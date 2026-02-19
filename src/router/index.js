import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginView },
    {
      path: '/dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products',
      component: () => import('../views/ProductsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products/add',
      component: () => import('../views/AddProductView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products/edit/:id',
      component: () => import('../views/EditProductView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/categories',
      component: () => import('../views/CategoriesView.vue'),
      meta: { requiresAuth: true }
    },
    {
  path: '/orders',
  component: () => import('../views/OrdersView.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/orders/add',
  component: () => import('../views/AddOrderView.vue'),
  meta: { requiresAuth: true }
}


  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return '/login'
  }
})

export default router
