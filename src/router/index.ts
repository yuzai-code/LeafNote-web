import { createRouter, createWebHistory } from 'vue-router'
import Editor from '@/views/Editor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/editor',
      name: 'editor',
      component: Editor
    }
    // ... 其他路由
  ]
})

export default router 