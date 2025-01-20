import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const content = ref('')
  const isModified = ref(false)

  const setContent = (newContent: string) => {
    content.value = newContent
    isModified.value = true
  }

  const resetModified = () => {
    isModified.value = false
  }

  return {
    content,
    isModified,
    setContent,
    resetModified
  }
}) 