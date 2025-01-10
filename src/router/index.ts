import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import Home from '../views/Home.vue'
import Notes from '../views/Notes.vue'
import Tags from '../views/Tags.vue'
import Categories from '../views/Categories.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: Home
        },
        {
          path: 'notes',
          name: 'notes',
          component: Notes
        },
        {
          path: 'tags',
          name: 'tags',
          component: Tags
        },
        {
          path: 'categories',
          name: 'categories',
          component: Categories
        }
      ]
    }
  ]
})

export default router 