import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EarningZakatView from '../views/EarningZakatView.vue'
import AboutView from '../views/AboutView.vue'

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
      path: '/about-us',
      name: 'about-us',
      component: AboutView,
    },
  ],
})

export default router
