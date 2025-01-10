<template>
  <dialog :class="{ 'modal modal-open': modelValue }" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">移动到</h3>
      <div class="max-h-[60vh] overflow-y-auto">
        <ul class="menu bg-base-200 rounded-box">
          <li v-for="folder in folders" :key="folder.id">
            <div class="flex items-center gap-2 hover:bg-base-300 rounded-lg p-2" 
                 :class="{ 'bg-primary text-primary-content': isSelected(folder) }"
                 @click="handleSelect(folder)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {{ folder.name }}
            </div>
            <ul v-if="folder.children?.length" class="pl-4">
              <li v-for="child in folder.children" :key="child.id">
                <div class="flex items-center gap-2 hover:bg-base-300 rounded-lg p-2"
                     :class="{ 'bg-primary text-primary-content': isSelected(child) }"
                     @click="handleSelect(child)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {{ child.name }}
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="modal-action">
        <button class="btn btn-primary" 
                :disabled="!selectedFolder || isCurrentFolder"
                @click="handleConfirm">
          确认
        </button>
        <button class="btn" @click="handleCancel">取消</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="handleCancel">关闭</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Category } from '../types'

const props = defineProps<{
  modelValue: boolean
  folders: Category[]
  currentFolder?: Category
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', folder: Category): void
}>()

const selectedFolder = ref<Category | null>(null)

const isCurrentFolder = computed(() => {
  if (!selectedFolder.value || !props.currentFolder) return false
  return selectedFolder.value.id === props.currentFolder.id
})

const isSelected = (folder: Category) => {
  return selectedFolder.value?.id === folder.id
}

const handleSelect = (folder: Category) => {
  selectedFolder.value = folder
}

const handleConfirm = () => {
  if (selectedFolder.value) {
    emit('select', selectedFolder.value)
  }
  handleCancel()
}

const handleCancel = () => {
  selectedFolder.value = null
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-box {
  max-width: 32rem;
}
</style> 