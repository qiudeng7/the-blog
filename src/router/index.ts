import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/software-development',
    name: 'SoftwareDevelopment',
    component: () => import('../views/SoftwareDevelopment.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
