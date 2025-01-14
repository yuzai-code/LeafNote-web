<template>
  <node-view-wrapper class="image-component">
    <div class="image-container" :class="{ selected: selected }">
      <img
        :src="nodeViewProps.node.attrs.src"
        :alt="nodeViewProps.node.attrs.alt"
        :title="nodeViewProps.node.attrs.title"
        @click="selected = !selected"
      />
      <div v-if="selected" class="image-toolbar">
        <button class="btn btn-sm" @click="openEditDialog">
          编辑
        </button>
        <button class="btn btn-sm btn-error" @click="deleteImage">
          删除
        </button>
      </div>
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'
import type { NodeViewProps } from '@tiptap/vue-3'

const props = defineProps<{
  nodeViewProps: NodeViewProps
}>()

const selected = ref(false)

const openEditDialog = () => {
  // TODO: 实现图片编辑对话框
  const alt = prompt('请输入图片描述', props.nodeViewProps.node.attrs.alt)
  if (alt !== null) {
    props.nodeViewProps.updateAttributes({
      alt,
    })
  }
}

const deleteImage = () => {
  props.nodeViewProps.deleteNode()
}
</script>

<style lang="scss" scoped>
.image-component {
  @apply relative inline-block;

  .image-container {
    @apply relative inline-block;

    img {
      @apply max-w-full h-auto;
    }

    &.selected {
      @apply ring-2 ring-primary ring-offset-2;
    }

    .image-toolbar {
      @apply absolute top-2 right-2 flex gap-2 bg-base-200 p-1 rounded-lg shadow-lg;
    }
  }
}
</style> 