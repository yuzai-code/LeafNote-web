<template>
  <div class="flex h-screen">
    <!-- 左侧侧边栏 -->
    <div class="w-16 bg-base-200 flex flex-col items-center py-4 gap-2">
      <router-link to="/" class="btn btn-ghost btn-square">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </router-link>
      <router-link to="/notes" class="btn btn-ghost btn-square">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </router-link>
      <router-link to="/tags" class="btn btn-ghost btn-square">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      </router-link>
    </div>

    <!-- 中间侧边栏 -->
    <!--     <div v-if="showSidebar" class="w-80 bg-base-100 border-r">
      <SidebarFolderTree v-if="route.path === '/notes'" @select-note="handleNoteSelect" />
      <div v-else-if="route.path === '/tags'" class="h-full p-4">
        <h2 class="text-lg font-bold">标签</h2>
      </div>
    </div -->

    <!-- 主要内容区域 -->
    <div class="flex-1 bg-base-100 overflow-auto">
      <router-view v-slot="{ Component }">
        <component
          :is="Component"
          :current-note="currentNote"
          @create-note="handleCreateNote"
        />
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note } from "../types";
import { ref } from "vue";

const currentNote = ref<Note | null>(null);

// 处理创建笔记
const handleCreateNote = () => {
  // TODO: 实现创建笔记的逻辑
};
</script>

<style scoped>
.h-screen {
  height: 100vh;
  min-height: 100vh;
}
</style>
