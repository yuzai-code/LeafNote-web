<template>
  <div
    class="flex items-center justify-between py-1 px-2 hover:bg-base-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
    :class="{ 'bg-primary text-primary-content': isActive }"
    @click="handleClick"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <div class="flex-1">
      <div v-if="isRenaming" class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <input
          type="text"
          v-model="renameValue"
          class="input input-bordered input-sm w-full max-w-xs"
          @keyup.enter="handleRenameConfirm"
          @keyup.esc="$emit('cancel-rename')"
          @blur="handleRenameConfirm"
          :data-rename-id="note.id"
          @click.stop
        />
      </div>
      <span v-else class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        {{ noteTitle }}
      </span>
    </div>
    <div class="flex-none">
      <div class="dropdown dropdown-end">
        <button class="btn btn-ghost btn-sm" @click.stop="handleDropdownClick">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-5 w-5 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </button>
        <ul
          v-if="showDropdown"
          class="dropdown-content z-[1] menu menu-sm p-2 shadow bg-base-100 rounded-box w-28"
          @click.stop
        >
          <li><button @click.stop="$emit('rename')">重命名</button></li>
          <li><button @click.stop="$emit('move')">移动</button></li>
          <li><button @click.stop="$emit('delete')" class="text-error">删除</button></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import type { Note } from "../types";

const props = defineProps<{
  note: Note;
  isActive: boolean;
  isRenaming: boolean;
}>();

const noteTitle = ref(props.note.title);

watch(
  () => props.note.title,
  (newTitle) => {
    noteTitle.value = newTitle;
  }
);

const emit = defineEmits<{
  (e: "click", note: Note): void;
  (e: "rename"): void;
  (e: "move"): void;
  (e: "delete"): void;
  (e: "rename-confirm", value: string): void;
  (e: "cancel-rename"): void;
  (e: "renamed", note: Note): void;
}>();

const showDropdown = ref(false);
const renameValue = ref(props.note.title);

const handleClick = () => {
  emit("click", props.note);
};

const handleDropdownClick = (event: MouseEvent) => {
  event.stopPropagation();
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    nextTick(() => {
      const button = event.currentTarget as HTMLElement;
      const dropdown = button.nextElementSibling as HTMLElement;
      if (!dropdown) return;

      const rect = button.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + 8}px`;
      dropdown.style.left = `${rect.right - dropdown.offsetWidth}px`;
    });
  }
};

const handleRenameConfirm = async () => {
  try {
    const response = await fetch(`/api/v1/notes/${props.note.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: renameValue.value,
        content: props.note.content,
      }),
    });

    if (!response.ok) {
      throw new Error("重命名失败");
    }

    const updatedNote = await response.json();
    emit("renamed", updatedNote);
    emit("rename-confirm", renameValue.value);
    showDropdown.value = false;
  } catch (error) {
    console.error("重命名失败:", error);
    alert("重命名失败");
    // 还原修改
    renameValue.value = props.note.title;
  }
};

// 在组件挂载时添加全局点击事件来关闭下拉菜单
const closeDropdown = () => {
  showDropdown.value = false;
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});

const handleDragStart = (event: DragEvent) => {
  if (!event.dataTransfer) return;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData(
    "application/json",
    JSON.stringify({
      type: "note",
      id: props.note.id,
    })
  );
};
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
</style>
