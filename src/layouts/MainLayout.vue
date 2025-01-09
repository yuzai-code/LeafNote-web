<template>
  <n-layout has-sider>
    <!-- 侧边栏 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :default-value="activeKey"
        @update:value="handleMenuClick"
      />
    </n-layout-sider>

    <!-- 主内容区 -->
    <n-layout>
      <!-- 顶部导航 -->
      <n-layout-header bordered>
        <div class="header-content">
          <div class="header-left">
            <n-breadcrumb>
              <n-breadcrumb-item>LeafNote</n-breadcrumb-item>
              <n-breadcrumb-item>{{ currentRoute }}</n-breadcrumb-item>
            </n-breadcrumb>
          </div>
          <div class="header-right">
            <n-button-group>
              <n-button secondary type="primary" @click="toggleDark()">
                <template #icon>
                  <n-icon>
                    <SunnySharp v-if="isDark" />
                    <MoonSharp v-else />
                  </n-icon>
                </template>
              </n-button>
              <n-button secondary type="primary">
                <template #icon>
                  <n-icon><SettingsSharp /></n-icon>
                </template>
              </n-button>
            </n-button-group>
          </div>
        </div>
      </n-layout-header>

      <!-- 内容区 -->
      <n-layout-content content-style="padding: 24px;">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { SunnySharp, MoonSharp, SettingsSharp, DocumentTextSharp, PricetagsSharp, FolderSharp, HomeSharp } from '@vicons/ionicons5'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
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

// 渲染图标的辅助函数
function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// 侧边栏菜单配置
const menuOptions: MenuOption[] = [
  {
    label: '首页',
    key: 'home',
    icon: renderIcon(HomeSharp)
  },
  {
    label: '笔记',
    key: 'notes',
    icon: renderIcon(DocumentTextSharp)
  },
  {
    label: '分类',
    key: 'categories',
    icon: renderIcon(FolderSharp)
  },
  {
    label: '标签',
    key: 'tags',
    icon: renderIcon(PricetagsSharp)
  }
]

// 处理菜单点击
function handleMenuClick(key: string) {
  router.push({ name: key })
}
</script>

<style scoped>
.header-content {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 