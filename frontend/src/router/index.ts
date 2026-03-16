import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EarningZakatView from '../views/EarningZakatView.vue'
import AboutView from '../views/AboutView.vue'
import CalculatorView from '../views/CalculatorView.vue'
import AdminLoginView from '../views/admin/AdminLoginView.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'

import FitrahZakatView from '../views/FitrahZakatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/earning-zakat-info',
      name: 'earning-zakat-info',
      component: EarningZakatView,
    },
    {
      path: '/fitrah-zakat-info',
      name: 'fitrah-zakat-info',
      component: FitrahZakatView,
    },
    {
      path: '/about-us',
      name: 'about-us',
      component: AboutView,
    },
    {
      path: '/zakat-calculator',
      name: 'zakat-calculator',
      component: CalculatorView,
    },
    {
      path: '/admin',
      redirect: '/admin/login',
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLoginView,
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true }
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && localStorage.getItem('admin_auth') !== 'true') {
    next('/admin/login')
  } else if (to.name === 'admin-login' && localStorage.getItem('admin_auth') === 'true') {
    next('/admin/dashboard')
  } else {
    next()
  }
})

export default router
