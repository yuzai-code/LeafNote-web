<template>
  <BubbleMenu
    v-if="editor"
    :editor="editor"
    :tippy-options="{ duration: 100 }"
    class="bubble-menu"
  >
    <button
      v-for="item in bubbleItems"
      :key="item.name"
      class="bubble-menu-button"
      :class="{ active: item.isActive?.() }"
      @click="item.action"
    >
      {{ item.label }}
    </button>
  </BubbleMenu>
</template>

<script setup lang="ts">
import { BubbleMenu } from '@tiptap/vue-3'
import type { Editor } from '@tiptap/vue-3'
import { computed } from 'vue'

const props = defineProps<{
  editor: Editor | undefined
}>()

const bubbleItems = computed(() => [
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
    name: 'code',
    label: '代码',
    action: () => props.editor?.chain().focus().toggleCode().run(),
    isActive: () => props.editor?.isActive('code'),
  },
])
</script>

<style lang="scss" scoped>
.bubble-menu {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: var(--bg-base-200);

  .bubble-menu-button {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--bg-base-300);
    }

    &.active {
      background-color: var(--bg-primary);
      color: var(--text-primary-content);
    }
  }
}
</style> 