<template>
  <div class="h-full">
    <!-- 目录标题 -->
    <div class="max-w-[1400px] mx-auto px-[40px] py-4 border-b">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold">{{ folder?.name || '所有笔记' }}</h1>
        <span class="text-sm text-base-content/70">{{ notes?.length || 0 }} 篇笔记</span>
      </div>
    </div>
    
    <!-- 笔记卡片列表 -->
    <div class="max-w-[1400px] mx-auto px-[40px] py-6">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="loading loading-spinner loading-md"></div>
      </div>
      <!-- 笔记列表 -->
      <div v-else-if="notes && notes.length > 0" 
           class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div
          v-for="note in notes"
          :key="note.id"
          class="card bg-base-100 border hover:border-primary transition-all duration-200 cursor-pointer group h-[480px]"
          @click="$emit('select-note', note)"
        >
          <div class="card-body p-6 flex flex-col h-full">
            <h2 class="card-title text-base group-hover:text-primary transition-colors line-clamp-1 flex-none">
              {{ note.title }}
            </h2>
            <!-- 预览内容 -->
            <div class="preview-content flex-1 mt-3 overflow-hidden">
              <p class="text-sm text-base-content/70 whitespace-pre-line h-full">
                {{ getPreviewContent(note.content || '') }}
              </p>
            </div>
            <!-- 元信息 -->
            <div class="card-actions justify-between items-center mt-4 pt-3 border-t flex-none">
              <div class="flex items-center gap-2 text-xs text-base-content/50">
                <span>{{ getWordCount(note.content || '') }} 字</span>
                <span class="text-base-content/30">·</span>
                <span>{{ formatDate(note.updated_at) }}</span>
              </div>
              <!-- 标签展示 -->
              <div class="flex gap-1 flex-wrap" v-if="note.tags && note.tags.length">
                <span 
                  v-for="tag in note.tags.slice(0, 2)" 
                  :key="tag.id"
                  class="badge badge-sm"
                >
                  {{ tag.name }}
                </span>
                <span v-if="note.tags.length > 2" class="badge badge-sm">...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-16 text-base-content/50">
        <svg class="w-20 h-20 mb-4 stroke-current opacity-50" viewBox="0 0 24 24" fill="none">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="mb-2 text-lg">{{ folder ? `${folder.name}目录下暂无笔记` : '暂无笔记' }}</p>
        <p class="text-sm">点击左上角的"+"按钮创建新笔记</p>
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

// 获取预览内容
const getPreviewContent = (markdown: string) => {
  // 首先移除 YAML front matter
  const content = markdown.replace(/^---[\s\S]*?---/, '').trim();
  
  return content
    .replace(/#+\s/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，保留文本
    .replace(/`(.*?)`/g, '$1') // 移除代码
    .replace(/~~(.*?)~~/g, '$1') // 移除删除线
    .replace(/^\s*[-*+]\s/gm, '') // 移除列表标记
    .replace(/^\s*\d+\.\s/gm, '') // 移除有序列表标记
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/\n{2,}/g, '\n') // 将多个换行替换为单个换行
    .replace(/\!\[.*?\]\(.*?\)/g, '[图片]') // 将图片替换为[图片]标记
    .trim()
    .slice(0, 800); // 增加预览内容长度到800字
};

// 获取字数统计
const getWordCount = (content: string): number => {
  // 移除所有 Markdown 标记
  const plainText = content
    .replace(/^---[\s\S]*?---/, '') // 移除 YAML front matter
    .replace(/[#*`~\[\]()]/g, '') // 移除常见 Markdown 标记
    .replace(/\!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .trim();

  // 计算中文字符和英文单词
  const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = plainText
    .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文字符
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  return chineseChars + englishWords;
};
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-8 {
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-12 {
  display: -webkit-box;
  -webkit-line-clamp: 12;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-content {
  position: relative;
  height: calc(100% - 2rem); /* 减去标题和底部信息的高度 */
}

.preview-content p {
  position: relative;
  height: 100%;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, black calc(100% - 3rem), transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 3rem), transparent 100%);
}

.card {
  @apply transition-all duration-200;
  border: 1px solid var(--b3);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -2px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.1);
}

/* 调整卡片内边距和间距 */
.card-body {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

/* 优化标签样式 */
.badge {
  @apply h-5 min-h-0;
  padding: 0 0.5rem;
  font-size: 0.75rem;
}

/* 优化底部信息样式 */
.card-actions {
  position: relative;
  background: var(--b1);
}
</style> 