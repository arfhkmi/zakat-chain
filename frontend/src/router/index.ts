import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import IncomeZakatView from '../views/IncomeZakatView.vue'
import AboutView from '../views/AboutView.vue'
import IncomeCalculatorView from '../views/IncomeCalculatorView.vue'
import AdminLoginView from '../views/admin/AdminLoginView.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'

import FitrahZakatView from '../views/FitrahZakatView.vue'
import FitrahCalculatorView from '../views/FitrahCalculatorView.vue'
import ZakatSelectView from '../views/ZakatSelectView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/income-zakat-info',
      name: 'income-zakat-info',
      component: IncomeZakatView,
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
      path: '/pay-zakat',
      name: 'pay-zakat',
      component: ZakatSelectView,
    },
    {
      path: '/fitrah-zakat-calculator',
      name: 'fitrah-zakat-calculator',
      component: FitrahCalculatorView,
    },
    {
      path: '/income-zakat-calculator',
      name: 'income-zakat-calculator',
      component: IncomeCalculatorView,
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
