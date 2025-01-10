<template>
  <div class="h-full flex flex-col">
    <div class="flex-none p-4 border-b">
      <h2 class="text-lg font-bold">目录</h2>
    </div>
    <div class="flex-1 overflow-y-auto">
      <FolderTree @select-note="handleNoteSelect" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FolderTree from './FolderTree.vue'
import type { Note } from '../types'

// 定义事件
const emit = defineEmits<{
  (e: 'select-note', note: Note | null): void
}>()

// 处理笔记选择
const handleNoteSelect = (note: Note | null) => {
  emit('select-note', note)
}
</script> 