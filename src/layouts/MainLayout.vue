<template>
  <n-layout class="main-layout">
    <n-layout-header class="header" bordered>
      <div class="header-content">
        <div class="logo">
          <h1>LeafNote</h1>
        </div>
        <div class="header-right">
          <n-button-group>
            <n-button @click="toggleTheme">
              <template #icon>
                <moon v-if="isDark" theme="outline" />
                <sun v-else theme="outline" />
              </template>
            </n-button>
          </n-button-group>
        </div>
      </div>
    </n-layout-header>

    <n-layout has-sider>
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
          :value="activeKey"
          @update:value="handleMenuUpdate"
        />
      </n-layout-sider>

      <n-layout-content class="content">
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
import { Moon, Sun, Home, DocDetail } from '@icon-park/vue-next'
import { useOsTheme } from 'naive-ui'
import type { MenuOption } from 'naive-ui'

const router = useRouter()
const collapsed = ref(false)
const activeKey = ref('home')
const isDark = ref(useOsTheme().value === 'dark')

const toggleTheme = () => {
  isDark.value = !isDark.value
}

const menuOptions: MenuOption[] = [
  {
    label: '首页',
    key: 'home',
    icon: renderIcon(Home),
  },
  {
    label: '笔记',
    key: 'notes',
    icon: renderIcon(DocDetail),
  },
  {
    label: '分类',
    key: 'categories',
  }
]

function renderIcon(icon: any) {
  return () => h(icon)
}

const handleMenuUpdate = (key: string) => {
  activeKey.value = key
  router.push({ name: key })
}
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
}

.header {
  height: 64px;
  padding: 0 24px;
  
  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .logo {
      h1 {
        margin: 0;
        font-size: 24px;
      }
    }
  }
}

.content {
  padding: 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 