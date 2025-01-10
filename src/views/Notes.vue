<template>
  <div class="flex h-full gap-4">
    <!-- 左侧侧边栏 -->
    <div class="w-80 bg-base-200 rounded-lg p-4 flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <button class="btn btn-primary btn-sm" @click="handleNewNote">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          新建笔记
        </button>
      </div>
      
      <!-- 搜索框 -->
      <div class="form-control">
        <div class="input-group">
          <input 
            type="text" 
            v-model="searchText"
            placeholder="搜索笔记..." 
            class="input input-bordered w-full"
          />
          <button class="btn btn-square">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="tabs tabs-boxed">
        <a 
          class="tab" 
          :class="{ 'tab-active': activeTab === 'notes' }"
          @click="activeTab = 'notes'"
        >笔记</a>
        <a 
          class="tab"
          :class="{ 'tab-active': activeTab === 'categories' }"
          @click="activeTab = 'categories'"
        >分类</a>
        <a 
          class="tab"
          :class="{ 'tab-active': activeTab === 'tags' }"
          @click="activeTab = 'tags'"
        >标签</a>
      </div>

      <!-- 笔记列表 -->
      <div v-if="activeTab === 'notes'" class="flex-1 overflow-y-auto">
        <div 
          v-for="note in filteredNotes" 
          :key="note.id"
          class="card bg-base-100 shadow-sm mb-2 cursor-pointer hover:bg-base-300"
          :class="{ 'bg-primary text-primary-content': currentNote?.id === note.id }"
          @click="handleSelectNote(note)"
        >
          <div class="card-body p-4">
            <h3 class="card-title text-sm">{{ note.title || '未命名笔记' }}</h3>
            <div class="text-xs opacity-70">
              <span>{{ formatDate(note.created_at) }}</span>
              <div class="badge badge-sm" v-if="note.category">
                {{ note.category.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分类列表 -->
      <div v-if="activeTab === 'categories'" class="flex-1 overflow-y-auto">
        <ul class="menu bg-base-100 rounded-box">
          <li v-for="category in categoryTreeData" :key="category.key">
            <a 
              :class="{ 'active': selectedCategoryKeys.includes(category.key) }"
              @click="handleCategorySelect([category.key])"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {{ category.label }}
            </a>
          </li>
        </ul>
      </div>

      <!-- 标签列表 -->
      <div v-if="activeTab === 'tags'" class="flex-1 overflow-y-auto">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in tagOptions"
            :key="tag.value"
            class="badge badge-lg cursor-pointer"
            :class="{ 'badge-primary': selectedTagIds.includes(tag.value) }"
            @click="handleTagClick(tag.value)"
          >
            {{ tag.label }}
          </div>
        </div>
      </div>
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
        <button class="btn btn-primary" @click="handleNewNote">
          新建笔记
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { formatDate } from '../utils/date'
import type { Note } from '../types/note'

// 搜索
const searchText = ref('')

// 侧边栏标签页
const activeTab = ref('notes')
const selectedCategoryKeys = ref<string[]>([])
const selectedTagIds = ref<string[]>([])

// 分类树形数据
const categoryTreeData = computed(() => {
  return categoryOptions.value.map(category => ({
    key: category.value,
    label: category.label
  }))
})

// 处理分类选择
const handleCategorySelect = (keys: string[]) => {
  selectedCategoryKeys.value = keys
  filterNotesByCategory()
}

// 处理标签点击
const handleTagClick = (tagId: string) => {
  const index = selectedTagIds.value.indexOf(tagId)
  if (index > -1) {
    selectedTagIds.value.splice(index, 1)
  } else {
    selectedTagIds.value.push(tagId)
  }
  filterNotesByTags()
}

// 根据分类筛选笔记
const filterNotesByCategory = () => {
  if (selectedCategoryKeys.value.length === 0) {
    return notes.value
  }
  return notes.value.filter(note => 
    note.category && selectedCategoryKeys.value.includes(note.category.id)
  )
}

// 根据标签筛选笔记
const filterNotesByTags = () => {
  if (selectedTagIds.value.length === 0) {
    return notes.value
  }
  return notes.value.filter(note => 
    note.tags.some(tag => selectedTagIds.value.includes(tag.id))
  )
}

// 搜索和筛选笔记
const filteredNotes = computed(() => {
  let filtered = notes.value

  // 应用分类筛选
  if (selectedCategoryKeys.value.length > 0) {
    filtered = filterNotesByCategory()
  }

  // 应用标签筛选
  if (selectedTagIds.value.length > 0) {
    filtered = filterNotesByTags()
  }

  // 应用搜索
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(note => 
      note.title.toLowerCase().includes(search) || 
      note.content.toLowerCase().includes(search)
    )
  }

  return filtered
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
  try {
    // 创建笔记的代码
    console.log('创建笔记:', title)
  } catch (error) {
    console.error('创建笔记失败:', error)
  }
}

// 保存笔记
const handleSaveNote = async () => {
  if (!currentNote.value) return
  try {
    // 保存笔记的代码
    console.log('保存笔记:', currentNote.value.title)
  } catch (error) {
    console.error('保存笔记失败:', error)
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
:deep(.md-editor) {
  height: calc(100% - 80px);
}
</style> 