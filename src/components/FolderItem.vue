<template>
  <div>
    <div class="flex items-center justify-between py-1 px-2 hover:bg-base-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer" 
         @click="$emit('toggle', folder)">
      <div class="flex-1 flex items-center gap-2">
        <div class="flex items-center">
          <svg v-if="isExpanded" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <svg v-if="isExpanded" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <div v-if="isRenaming" class="flex-1" @click.stop>
          <input 
            type="text" 
            v-model="renameValue" 
            class="input input-bordered input-sm w-full"
            @keyup.enter="handleRenameConfirm"
            @keyup.esc="$emit('cancel-rename')"
            @blur="handleRenameConfirm"
            :data-rename-id="folder.id"
          />
        </div>
        <span v-else class="flex-1 text-left text-base">
          {{ folder.name }}
        </span>
      </div>
      <div class="flex-none" @click.stop>
        <div class="dropdown dropdown-end">
          <button class="btn btn-ghost btn-sm" @click="handleDropdownClick">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
          </button>
          <ul v-if="showDropdown" 
              class="dropdown-content z-[1] menu menu-sm p-2 shadow bg-base-100 rounded-box w-52"
              @click.stop>
            <li><button @click="$emit('create-note')">新建笔记</button></li>
            <li><button @click="$emit('create-folder')">新建子目录</button></li>
            <li><button @click="$emit('rename')">重命名</button></li>
            <li><button @click="$emit('delete')" class="text-error">删除</button></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 子目录和笔记 -->
    <transition name="expand" @enter="expandEnter" @leave="expandLeave" @after-enter="expandAfterEnter" @after-leave="expandAfterLeave">
      <div v-show="isExpanded" class="pl-4 overflow-hidden">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Category } from '../types'

const props = defineProps<{
  folder: Category
  isExpanded: boolean
  isRenaming: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', folder: Category): void
  (e: 'create-note'): void
  (e: 'create-folder'): void
  (e: 'rename'): void
  (e: 'delete'): void
  (e: 'rename-confirm', value: string): void
  (e: 'cancel-rename'): void
}>()

const showDropdown = ref(false)
const renameValue = ref(props.folder.name)

const handleDropdownClick = (event: MouseEvent) => {
  event.stopPropagation()
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    nextTick(() => {
      const button = event.currentTarget as HTMLElement
      const dropdown = button.nextElementSibling as HTMLElement
      if (!dropdown) return

      const rect = button.getBoundingClientRect()
      dropdown.style.top = `${rect.bottom + 8}px`
      dropdown.style.left = `${rect.right - dropdown.offsetWidth}px`
    })
  }
}

const handleRenameConfirm = () => {
  emit('rename-confirm', renameValue.value)
}

// 在组件挂载时添加全局点击事件来关闭下拉菜单
const closeDropdown = () => {
  showDropdown.value = false
}

// 展开动画相关函数
const expandEnter = (el: Element) => {
  const element = el as HTMLElement
  const height = element.scrollHeight
  element.style.maxHeight = '0'
  // 强制重绘
  element.offsetHeight
  element.style.maxHeight = height + 'px'
}

const expandLeave = (el: Element) => {
  const element = el as HTMLElement
  const height = element.scrollHeight
  element.style.maxHeight = height + 'px'
  // 强制重绘
  element.offsetHeight
  element.style.maxHeight = '0'
}

const expandAfterEnter = (el: Element) => {
  (el as HTMLElement).style.maxHeight = 'none'
}

const expandAfterLeave = (el: Element) => {
  (el as HTMLElement).style.maxHeight = 'none'
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.dropdown-content {
  position: fixed !important;
  z-index: 9999 !important;
  opacity: 1;
  visibility: visible;
  transform-origin: top right;
  animation: dropdown-show 0.1s ease-out;
}

@keyframes dropdown-show {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: visible !important;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}
</style> 