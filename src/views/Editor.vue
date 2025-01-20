<template>
  <div class="editor-page">
    <MuyaEditor
      v-model="content"
      @change="handleContentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MuyaEditor from '@/components/MuyaEditor.vue'

const content = ref('')

const handleContentChange = (value: string) => {
  // 这里可以处理内容变化，比如自动保存等
  console.log('Content changed:', value)
}
</script>

<style scoped>
.editor-page {
  @apply h-full w-full;
}
</style> 