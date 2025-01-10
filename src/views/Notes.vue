<template>
  <div class="flex h-screen">
    <!-- 左侧目录树 -->
    <div class="w-64 border-r">
      <FolderTree 
        ref="folderTreeRef"
        @select-note="handleSelectNote" 
      />
    </div>
    
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
      <MdEditor
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
        <button class="btn btn-primary" @click="handleCreateNote">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
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
import FolderTree from '../components/FolderTree.vue'
import type { Note } from '../types'

// 当前编辑的笔记
const currentNote = ref<Note | null>(null)
const folderTreeRef = ref<InstanceType<typeof FolderTree> | null>(null)
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

// 处理笔记选择
const handleSelectNote = (note: Note | null) => {
  console.log('选中笔记:', note)
  currentNote.value = note
}

// 处理新建笔记
const handleCreateNote = async () => {
  const currentFolder = folderTreeRef.value?.getCurrentFolder()
  if (!currentFolder) {
    alert('请先选择一个目录')
    return
  }

  try {
    // 获取可用的笔记名称
    const defaultTitle = '新建笔记'
    const filePath = `${currentFolder.path}/${defaultTitle}.md`

    const response = await fetch('/api/v1/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: defaultTitle,
        content: '',
        category_id: currentFolder.id,
        file_path: filePath,
        tag_ids: []
      })
    })

    if (!response.ok) {
      throw new Error('创建笔记失败')
    }

    const newNote = await response.json()
    currentNote.value = newNote

    // 刷新目录树
    await folderTreeRef.value?.handleFolderClick(currentFolder)
  } catch (error) {
    console.error('创建笔记失败:', error)
    alert('创建笔记失败')
  }
}

// Markdown 编辑器工具栏配置
const toolbars: string[] = [
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