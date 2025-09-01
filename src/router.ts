import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
const Login = () => import('./pages/auth/Login.vue')
const Register = () => import('./pages/auth/Register.vue')
const Forgot = () => import('./pages/auth/Forgot.vue')
const Reset = () => import('./pages/auth/Reset.vue')

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/forgot', component: Forgot },
    { path: '/reset', component: Reset },
  ],
})
