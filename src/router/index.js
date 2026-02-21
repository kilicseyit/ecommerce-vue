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
},
{
  path: '/users',
  component: () => import('../views/UsersView.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
},
{
  path: '/products/:id',
  component: () => import('../views/ProductDetailView.vue'),
  meta: { requiresAuth: true }
},{
  path: '/marketplace',
  component: () => import('../views/MarketplaceView.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/my-products',
  component: () => import('../views/MyProductsView.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/pending-reviews',
  component: () => import('../views/PendingReviewsView.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
},
{ path: '/cart', component: () => import('../views/CartView.vue'), meta: { requiresAuth: true } },
{ path: '/my-orders', component: () => import('../views/MyOrdersView.vue'), meta: { requiresAuth: true } },
{
  path: '/statistics',
  component: () => import('../views/StatisticsView.vue'),
  meta: { requiresAuth: true }
},
{ path: '/favorites', component: () => import('../views/FavoritesView.vue'), meta: { requiresAuth: true } },
{ path: '/messages', component: () => import('../views/MessagesView.vue'), meta: { requiresAuth: true } },


  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return '/login'
  }
})

export default router
