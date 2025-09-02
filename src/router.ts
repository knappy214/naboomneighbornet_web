import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Home from './pages/Home.vue'
const Login = () => import('./pages/auth/Login.vue')
const Register = () => import('./pages/auth/Register.vue')
const Forgot = () => import('./pages/auth/Forgot.vue')
const Reset = () => import('./pages/auth/Reset.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      component: Login,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      component: Register,
      meta: { requiresGuest: true },
    },
    {
      path: '/forgot',
      component: Forgot,
      meta: { requiresGuest: true },
    },
    {
      path: '/reset',
      component: Reset,
      meta: { requiresGuest: true },
    },
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.accessToken && authStore.accessToken.length > 0

  // Check if route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    } else {
      next()
    }
  }
  // Check if route requires guest (not authenticated)
  else if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      next('/')
    } else {
      next()
    }
  }
  // No special requirements
  else {
    next()
  }
})

export default router
