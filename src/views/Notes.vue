<template>
  <div class="notes-container">
    <!-- 左侧笔记列表 -->
    <div class="notes-sidebar">
      <div class="sidebar-header">
        <n-h3>笔记列表</n-h3>
        <n-button text type="primary" @click="handleNewNote">
          <template #icon>
            <n-icon><AddCircleSharp /></n-icon>
          </template>
          新建笔记
        </n-button>
      </div>
      <n-input
        v-model:value="searchText"
        type="text"
        placeholder="搜索笔记..."
        class="search-input"
      >
        <template #prefix>
          <n-icon><SearchOutline /></n-icon>
        </template>
      </n-input>
      <div class="notes-list">
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="note-item"
          :class="{ active: currentNote?.id === note.id }"
          @click="handleSelectNote(note)"
        >
          <div class="note-title">{{ note.title || '未命名笔记' }}</div>
          <div class="note-meta">
            <span class="note-date">{{ formatDate(note.created_at) }}</span>
            <n-space>
              <n-tag v-if="note.category" size="small" :bordered="false">
                {{ note.category.name }}
              </n-tag>
            </n-space>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧编辑区 -->
    <div class="editor-container" v-if="currentNote">
      <div class="editor-header">
        <n-input
          v-model:value="currentNote.title"
          type="text"
          placeholder="笔记标题"
          class="title-input"
          @blur="handleSaveNote"
        />
        <n-space>
          <n-select
            v-model:value="currentNote.category_id"
            :options="categoryOptions"
            placeholder="选择分类"
            clearable
            class="category-select"
            @update:value="handleSaveNote"
          />
          <n-select
            v-model:value="currentNote.tag_ids"
            :options="tagOptions"
            placeholder="选择标签"
            multiple
            clearable
            class="tag-select"
            @update:value="handleSaveNote"
          />
        </n-space>
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
    <div class="empty-state" v-else>
      <n-empty description="选择或创建一个笔记开始编辑">
        <template #extra>
          <n-button type="primary" @click="handleNewNote">
            新建笔记
          </n-button>
        </template>
      </n-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AddCircleSharp, SearchOutline } from '@vicons/ionicons5'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { formatDate } from '../utils/date'
import { useMessage } from 'naive-ui'
import type { Note, CreateNoteInput } from '../types/note'

const message = useMessage()

// 搜索
const searchText = ref('')
const filteredNotes = computed(() => {
  if (!searchText.value) return notes.value
  const search = searchText.value.toLowerCase()
  return notes.value.filter(note => 
    note.title.toLowerCase().includes(search) || 
    note.content.toLowerCase().includes(search)
  )
})

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

// 选择笔记
const handleSelectNote = (note: Note) => {
  currentNote.value = {
    ...note,
    category_id: note.category?.id || null,
    tag_ids: note.tags.map(tag => tag.id)
  }
}

// 新建笔记
const handleNewNote = async () => {
  const timestamp = new Date().getTime()
  const title = `新建笔记_${timestamp}`
  const newNote = {
    title,
    content: '',
    file_path: `/notes/${title}.md`,
    category_id: null,
    tag_ids: [],
    yaml_meta: ''
  }
  
  try {
    const res = await fetch('/api/v1/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newNote)
    })
    
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || '创建失败')
    }
    
    const data = await res.json()
    await fetchNotes()
    currentNote.value = {
      ...data.data,
      category_id: null,
      tag_ids: []
    }
    message.success('创建成功')
  } catch (error) {
    console.error('创建笔记失败:', error)
    message.error(error instanceof Error ? error.message : '创建失败')
  }
}

// 保存笔记
const handleSaveNote = async () => {
  if (!currentNote.value) return
  
  try {
    const res = await fetch(`/api/v1/notes/${currentNote.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: currentNote.value.title,
        content: currentNote.value.content,
        category_id: currentNote.value.category_id,
        tag_ids: currentNote.value.tag_ids
      })
    })
    
    if (!res.ok) {
      throw new Error('保存失败')
    }
    
    await fetchNotes()
  } catch (error) {
    console.error('保存笔记失败:', error)
    message.error('保存失败')
  }
}

// 笔记列表数据
const notes = ref<Note[]>([])

// 分类选项
const categoryOptions = ref<Array<{ label: string; value: string }>>([])

// 标签选项
const tagOptions = ref<Array<{ label: string; value: string }>>([])

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
  'revoke',
  'next',
  'save',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'htmlPreview',
  'catalog'
]

// 获取笔记列表
const fetchNotes = async () => {
  try {
    const res = await fetch('/api/v1/notes')
    const data = await res.json()
    notes.value = data.data
  } catch (error) {
    console.error('获取笔记列表失败:', error)
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await fetch('/api/v1/categories')
    const data = await res.json()
    categoryOptions.value = data.map((item: any) => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取标签列表
const fetchTags = async () => {
  try {
    const res = await fetch('/api/v1/tags')
    const data = await res.json()
    tagOptions.value = data.map((item: any) => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

onMounted(() => {
  fetchNotes()
  fetchCategories()
  fetchTags()
})
</script>

<style scoped>
.notes-container {
  display: flex;
  height: 100%;
  gap: 1px;
  background-color: var(--n-border-color);
}

.notes-sidebar {
  width: 300px;
  background-color: var(--n-color);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--n-border-color);
}

.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--n-border-color);
}

.search-input {
  margin: 16px;
}

.notes-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.note-item {
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.note-item:hover {
  background-color: var(--n-hover-color);
}

.note-item.active {
  background-color: var(--n-primary-color-hover);
  color: var(--n-primary-color);
}

.note-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.note-meta {
  font-size: 12px;
  color: var(--n-text-color-3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--n-color);
}

.editor-header {
  padding: 16px;
  border-bottom: 1px solid var(--n-border-color);
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.title-input {
  flex: 1;
}

.category-select,
.tag-select {
  min-width: 200px;
}

:deep(.md-editor) {
  flex: 1;
  border: none;
}

:deep(.md-editor-toolbar) {
  border-bottom: 1px solid var(--n-border-color);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--n-color);
}
</style> 