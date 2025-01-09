import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/Home.vue')
      },
      {
        path: 'notes',
        name: 'notes',
        component: () => import('../views/Notes.vue')
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('../views/Categories.vue')
      },
      {
        path: 'tags',
        name: 'tags',
        component: () => import('../views/Tags.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router 