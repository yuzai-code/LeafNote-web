import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import Home from '@/views/Home.vue'
import Notes from '@/views/Notes.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => Home,
      },
      {
        path: '/notes',
        name: 'notes',
        component: () => Notes,
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
}) 