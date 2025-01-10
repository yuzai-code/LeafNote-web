<template>
  <div class="flex h-full">
    <!-- 右侧编辑区 -->
    <div class="flex-1 bg-base-100 rounded-lg" v-if="currentNote">
      <div class="p-4 border-b">
        <input
          v-model="currentNote.title"
          type="text"
          placeholder="笔记标题"
          class="input input-lg w-full"
          @blur="handleSaveNote"
        />
      </div>
      <md-editor
        v-model="currentNote.content"
        :toolbars="toolbars"
        language="zh-CN"
        preview-theme="github"
        :autoFocus="true"
        @change="handleContentChange"
      />
    </div>
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <h3 class="text-lg font-bold mb-4">选择或创建一个笔记开始编辑</h3>
        <button class="btn btn-primary" @click="emit('create-note')">
          新建笔记
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { Note } from '../types'

// 当前编辑的笔记
const currentNote = ref<Note | null>(null)
let saveTimeout: number | null = null

// 自动保存防抖
const handleContentChange = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = window.setTimeout(() => {
    handleSaveNote()
  }, 1000)
}

// 保存笔记
const handleSaveNote = async () => {
  if (!currentNote.value) return
  try {
    const response = await fetch(`/api/v1/notes/${currentNote.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: currentNote.value.title,
        content: currentNote.value.content
      })
    })
    if (!response.ok) {
      alert('保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败')
  }
}

// 定义事件
const emit = defineEmits<{
  (e: 'create-note'): void
}>()

// Markdown 编辑器工具栏配置
const toolbars = [
  'bold',
  'underline',
  'italic',
  'strikethrough',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  'revoke',
  'next',
  'save',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'htmlPreview',
  'catalog'
]
</script>

<style scoped>
:deep(.md-editor) {
  height: calc(100% - 80px);
}
</style> 