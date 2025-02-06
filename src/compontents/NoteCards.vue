<template>
  <div class="h-full">
    <!-- 目录标题 -->
    <div class="max-w-[800px] mx-auto px-[50px] py-4 border-b">
      <h1 class="text-xl font-bold">{{ folder?.name || '所有笔记' }}</h1>
    </div>
    
    <!-- 笔记卡片列表 -->
    <div class="max-w-[800px] mx-auto px-[50px] py-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="loading loading-spinner loading-md"></div>
      </div>
      <!-- 笔记列表 -->
      <div v-else-if="notes && notes.length > 0" class="grid grid-cols-2 gap-4">
        <div
          v-for="note in notes"
          :key="note.id"
          class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          @click="$emit('select-note', note)"
        >
          <div class="card-body">
            <h2 class="card-title text-base">{{ note.title }}</h2>
            <p class="text-sm text-base-content/70 line-clamp-3">
              {{ stripMarkdown(note.content || '') }}
            </p>
            <div class="card-actions justify-end mt-2">
              <span class="text-xs text-base-content/50">
                {{ formatDate(note.updated_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- 空状态 -->
      <div v-else class="text-center text-base-content/50 py-8">
        {{ folder ? `${folder.name}目录下暂无笔记` : '暂无笔记' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { Note, Category } from '../api/types';

const props = defineProps<{
  folder: Category | null;
  notes: Note[] | null;
  loading?: boolean;
}>();

console.log('NoteCards props:', {
  folder: props.folder,
  notesLength: props.notes?.length,
  loading: props.loading
});

defineEmits<{
  (e: 'select-note', note: Note): void;
}>();

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 移除 Markdown 标记
const stripMarkdown = (markdown: string) => {
  return markdown
    .replace(/#+\s/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，保留文本
    .replace(/`(.*?)`/g, '$1') // 移除代码
    .replace(/~~(.*?)~~/g, '$1') // 移除删除线
    .replace(/^\s*[-*+]\s/gm, '') // 移除列表标记
    .replace(/^\s*\d+\.\s/gm, '') // 移除有序列表标记
    .replace(/\n{2,}/g, '\n') // 将多个换行替换为单个换行
    .trim();
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 