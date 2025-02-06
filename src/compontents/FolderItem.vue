<template>
  <div class="ml-auto flex items-center gap-1">
    <!-- 添加按钮 -->
    <!-- <button class="btn btn-ghost btn-xs" @click.stop>
      <svg class="h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
    </button> -->
    <div class="dropdown" ref="dropdownRef">
      <!-- 更多操作按钮 -->
      <button class="btn btn-ghost btn-xs" @click.stop="toggleDropdown">
        <svg class="h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01" />
        </svg>
      </button>
      <ul v-if="isOpen" 
          class="menu dropdown-content bg-base-100 rounded-box z-[9999] min-w-[7rem] whitespace-nowrap p-1 shadow absolute"
          :style="dropdownStyle"
          v-click-outside="closeDropdown">
        <li><a href="javascript:void(0)" @click.stop.prevent="handleCreateNote">新建笔记</a></li>
        <li><a href="javascript:void(0)" @click.stop.prevent="handleCreateFolder">新建目录</a></li>
        <li><a href="javascript:void(0)" @click.stop.prevent="handleRename">重命名</a></li>
        <li><a href="javascript:void(0)" @click.stop.prevent="handleDelete">删除</a></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface ExtendedHTMLElement extends HTMLElement {
  _clickOutside?: (event: MouseEvent) => void;
}

const dropdownRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const dropdownStyle = computed(() => {
  if (!dropdownRef.value) return {};
  const rect = dropdownRef.value.getBoundingClientRect();
  return {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    position: 'fixed' as const
  };
});

const emit = defineEmits<{
  (e: "create-note"): void;
  (e: "create-folder"): void;
  (e: "rename"): void;
  (e: "delete"): void;
}>();

const toggleDropdown = (e: MouseEvent) => {
  e.stopPropagation();
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

// 处理新建笔记
const handleCreateNote = (e: Event) => {
  e.stopPropagation();
  emit('create-note');
  closeDropdown();
};

// 处理新建目录
const handleCreateFolder = (e: Event) => {
  e.stopPropagation();
  emit('create-folder');
  closeDropdown();
};

// 处理重命名
const handleRename = (e: Event) => {
  e.stopPropagation();
  emit('rename');
  closeDropdown();
};

// 处理删除
const handleDelete = (e: Event) => {
  e.stopPropagation();
  emit('delete');
  closeDropdown();
};

// 点击外部关闭下拉菜单
const vClickOutside = {
  mounted(el: ExtendedHTMLElement, binding: any) {
    el._clickOutside = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el: ExtendedHTMLElement) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside);
    }
  }
};
</script>

<style scoped>
.dropdown-content {
  transform-origin: top;
}

/* 确保下拉菜单在最顶层 */
.dropdown {
  position: relative;
}

.dropdown .dropdown-content {
  position: fixed;
  margin-top: 0.5rem;
}

/* 添加菜单项的悬停效果 */
.menu li a {
  cursor: pointer;
  display: block;
  padding: 0.5rem 1rem;
}

.menu li a:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
