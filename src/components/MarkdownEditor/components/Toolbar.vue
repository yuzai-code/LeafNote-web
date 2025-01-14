<template>
  <div class="editor-toolbar border-b p-2 flex flex-wrap gap-2">
    <button
      v-for="item in toolbarItems"
      :key="item.name"
      class="btn btn-sm"
      :class="{ 'btn-active': item.isActive?.() }"
      @click="item.action"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{
  editor: Editor | undefined
}>()

const toolbarItems = computed(() => [
  {
    name: 'h1',
    label: 'H1',
    action: () => props.editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => props.editor?.isActive('heading', { level: 1 }),
  },
  {
    name: 'h2',
    label: 'H2',
    action: () => props.editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => props.editor?.isActive('heading', { level: 2 }),
  },
  {
    name: 'h3',
    label: 'H3',
    action: () => props.editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => props.editor?.isActive('heading', { level: 3 }),
  },
  {
    name: 'bold',
    label: '粗体',
    action: () => props.editor?.chain().focus().toggleBold().run(),
    isActive: () => props.editor?.isActive('bold'),
  },
  {
    name: 'italic',
    label: '斜体',
    action: () => props.editor?.chain().focus().toggleItalic().run(),
    isActive: () => props.editor?.isActive('italic'),
  },
  {
    name: 'bulletList',
    label: '无序列表',
    action: () => props.editor?.chain().focus().toggleBulletList().run(),
    isActive: () => props.editor?.isActive('bulletList'),
  },
  {
    name: 'orderedList',
    label: '有序列表',
    action: () => props.editor?.chain().focus().toggleOrderedList().run(),
    isActive: () => props.editor?.isActive('orderedList'),
  },
  {
    name: 'blockquote',
    label: '引用',
    action: () => props.editor?.chain().focus().toggleBlockquote().run(),
    isActive: () => props.editor?.isActive('blockquote'),
  },
  {
    name: 'code',
    label: '代码块',
    action: () => props.editor?.chain().focus().toggleCodeBlock().run(),
    isActive: () => props.editor?.isActive('codeBlock'),
  },
  {
    name: 'horizontalRule',
    label: '分割线',
    action: () => props.editor?.chain().focus().setHorizontalRule().run(),
  },
])
</script>

<style lang="scss" scoped>
.editor-toolbar {
  background-color: var(--bg-base-200);
  
  button {
    min-width: 40px;
  }
}
</style> 