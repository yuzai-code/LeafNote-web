<template>
  <div class="flex flex-col h-full">
    <!-- 笔记标题 -->
    <div class="p-4 border-b">
      <input
        v-if="note"
        v-model="localTitle"
        class="text-2xl font-bold w-full outline-none"
        placeholder="请输入标题"
        @blur="handleTitleChange"
      />
    </div>
    
    <!-- 笔记内容 -->
    <div v-if="note" class="flex-1 overflow-auto">
      <div class="h-full">
        <!-- 这里将使用 Markdown 编辑器 -->
        <textarea
          v-model="localContent"
          class="w-full h-full p-4 outline-none resize-none font-mono"
          placeholder="请输入笔记内容..."
          @blur="handleContentChange"
        ></textarea>
      </div>
    </div>
    
    <!-- 空状态提示 -->
    <div v-else class="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
      <p>请从左侧选择或创建笔记</p>
      <button class="btn btn-primary" @click="handleCreateNote">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        新建笔记
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Note } from '../types'

// 定义组件属性
const props = defineProps<{
  note: Note | null
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'update', note: Note): void
  (e: 'create'): void
}>()

// 本地状态
const localTitle = ref('')
const localContent = ref('')

// 监听笔记变化
watch(() => props.note, (newNote) => {
  console.log('笔记变化:', newNote)
  if (newNote) {
    localTitle.value = newNote.title
    localContent.value = newNote.content || ''
  } else {
    localTitle.value = ''
    localContent.value = ''
  }
}, { immediate: true })

// 处理标题变更
const handleTitleChange = async () => {
  if (!props.note || localTitle.value === props.note.title) return
  
  try {
    const response = await fetch(`/api/v1/notes/${props.note.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: localTitle.value,
        content: props.note.content
      })
    })
    
    if (!response.ok) {
      throw new Error('更新笔记失败')
    }
    
    const updatedNote = await response.json()
    emit('update', updatedNote)
  } catch (error) {
    console.error('更新笔记标题失败:', error)
    // 还原修改
    localTitle.value = props.note.title
  }
}

// 处理内容变更
const handleContentChange = async () => {
  if (!props.note || localContent.value === props.note.content) return
  
  try {
    const response = await fetch(`/api/v1/notes/${props.note.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: props.note.title,
        content: localContent.value
      })
    })
    
    if (!response.ok) {
      throw new Error('更新笔记失败')
    }
    
    const updatedNote = await response.json()
    emit('update', updatedNote)
  } catch (error) {
    console.error('更新笔记内容失败:', error)
    // 还原修改
    localContent.value = props.note.content || ''
  }
}

// 处理新建笔记
const handleCreateNote = () => {
  emit('create')
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style> 