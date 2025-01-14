import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Notes from "../views/Notes.vue";
import Example from "../views/Example.vue";
import MainLayout from "../layouts/MainLayout.vue";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: MainLayout,
      children: [
        {
          path: "",
          name: "home",
          component: Home,
        },
        {
          path: "/notes",
          name: "notes",
          component: Notes,
        },
        {
          path: "/example",
          name: "example",
          component: Example,
        },
      ],
    },
  ],
});

export default router;
