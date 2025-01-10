<template>
  <div class="drawer lg:drawer-open">
    <input id="main-drawer" type="checkbox" class="drawer-toggle" />
    
    <!-- 抽屉内容 -->
    <div class="drawer-content flex flex-col">
      <!-- 顶部导航栏 -->
      <div class="navbar bg-base-100 border-b">
        <div class="flex-none lg:hidden">
          <label for="main-drawer" class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </label>
        </div>
        <div class="flex-1">
          <div class="breadcrumbs text-sm">
            <ul>
              <li>LeafNote</li>
              <li>{{ currentRoute }}</li>
            </ul>
          </div>
        </div>
        <div class="flex-none">
          <button class="btn btn-ghost btn-circle" @click="toggleDark">
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <button class="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="p-6 flex-1">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>

    <!-- 侧边栏 -->
    <div class="drawer-side">
      <label for="main-drawer" class="drawer-overlay"></label>
      <ul class="menu p-4 w-60 h-full bg-base-200 text-base-content">
        <li v-for="item in menuOptions" :key="item.key">
          <a 
            :class="{ 'active': activeKey === item.key }"
            @click="handleMenuClick(item.key)"
          >
            <component :is="item.icon" class="w-5 h-5" />
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const router = useRouter()
const { isDark, toggleDark } = useTheme()

// 计算当前路由名称
const currentRoute = computed(() => {
  const routeNames: Record<string, string> = {
    home: '首页',
    notes: '笔记',
    categories: '分类',
    tags: '标签'
  }
  return routeNames[route.name as string] || '首页'
})

// 计算当前激活的菜单项
const activeKey = computed(() => {
  const name = route.name
  return name || 'home'
})

// 侧边栏菜单配置
const menuOptions = [
  {
    label: '首页',
    key: 'home',
    icon: 'i-heroicons-home'
  },
  {
    label: '笔记',
    key: 'notes',
    icon: 'i-heroicons-document-text'
  },
  {
    label: '分类',
    key: 'categories',
    icon: 'i-heroicons-folder'
  },
  {
    label: '标签',
    key: 'tags',
    icon: 'i-heroicons-tag'
  }
]

// 处理菜单点击
function handleMenuClick(key: string) {
  router.push({ name: key })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 