<template>
  <dialog :class="{ 'modal modal-open': modelValue }" class="modal">
    <div class="modal-box w-11/12 max-w-3xl">
      <h3 class="font-bold text-lg mb-4">移动到</h3>
      <div class="max-h-[70vh] min-h-[40vh] overflow-y-auto">
        <ul class="menu bg-base-200 rounded-box">
          <li v-for="folder in folders" :key="folder.id">
            <div
              class="flex items-center justify-between py-1 px-4 hover:bg-base-300 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
              :class="{ 'bg-primary text-primary-content': isSelected(folder) }"
              @click="handleSelect(folder)"
            >
              <div class="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 flex-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span class="text-base">{{ folder.name }}</span>
              </div>
              <div class="flex-none" @click.stop>
                <div class="dropdown dropdown-end">
                  <button class="btn btn-ghost btn-sm" @click="handleDropdownClick">
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
                    class="dropdown-content z-[1] menu menu-sm p-2 shadow bg-base-100 rounded-box w-40"
                    @click.stop
                  >
                    <li><button class="w-full text-center justify-center" @click="handleCreateNote">新建笔记</button></li>
                    <li><button class="w-full text-center justify-center" @click="handleCreateFolder">新建子目录</button></li>
                    <li><button class="w-full text-center justify-center" @click="handleRename">重命名</button></li>
                    <li><button class="w-full text-center justify-center" @click="handleMove">移动</button></li>
                    <li><button class="w-full text-center justify-center text-error" @click="handleDelete">删除</button></li>
                  </ul>
                </div>
              </div>
            </div>
            <ul v-if="folder.children?.length" class="pl-4">
              <li v-for="child in folder.children" :key="child.id">
                <div
                  class="flex items-center py-1 px-4 hover:bg-base-300 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                  :class="{ 'bg-primary text-primary-content': isSelected(child) }"
                  @click="handleSelect(child)"
                >
                  <div class="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 flex-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <span class="text-base">{{ child.name }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="modal-action">
        <button
          class="btn btn-primary"
          :disabled="!selectedFolder || isCurrentFolder"
          @click="handleConfirm"
        >
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { Category } from "../types";

const props = defineProps<{
  modelValue: boolean;
  folders: Category[];
  currentFolder?: Category;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "select", folder: Category): void;
}>();

const selectedFolder = ref<Category | null>(null);
const showDropdown = ref(false);

const isCurrentFolder = computed(() => {
  if (!selectedFolder.value || !props.currentFolder) return false;
  return selectedFolder.value.id === props.currentFolder.id;
});

const isSelected = (folder: Category) => {
  return selectedFolder.value?.id === folder.id;
};

const handleSelect = (folder: Category) => {
  selectedFolder.value = folder;
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

const closeDropdown = () => {
  showDropdown.value = false;
};

const handleCreateNote = () => {
  // 实现新建笔记逻辑
  closeDropdown();
};

const handleCreateFolder = () => {
  // 实现新建子目录逻辑
  closeDropdown();
};

const handleRename = () => {
  // 实现重命名逻辑
  closeDropdown();
};

const handleMove = () => {
  // 实现移动逻辑
  closeDropdown();
};

const handleDelete = () => {
  // 实现删除逻辑
  closeDropdown();
};

const handleConfirm = () => {
  if (selectedFolder.value) {
    emit("select", selectedFolder.value);
  }
  handleCancel();
};

const handleCancel = () => {
  selectedFolder.value = null;
  emit("update:modelValue", false);
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});
</script>

<style scoped>
.modal-box {
  width: auto;
  min-width: 300px;
  max-width: 90vw;
}

.menu {
  width: fit-content;
  margin: 0 auto;
}

.menu li {
  width: fit-content;
  min-width: 200px;
}

.menu li > div {
  width: 100%;
}

.dropdown-content {
  position: fixed !important;
  z-index: 9999 !important;
  opacity: 1;
  visibility: visible;
  transform-origin: top right;
  animation: dropdown-show 0.1s ease-out;
  width: fit-content !important;
  min-width: 10rem !important;
  max-width: 12rem !important;
}

.dropdown-content.menu :where(li:not(.menu-title) > *:not(ul):not(details):not(.menu-title)),
.dropdown-content.menu :where(li:not(.menu-title) > details > summary) {
  padding-left: 1rem;
  padding-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  width: 100%;
}

.dropdown-content li {
  width: 100%;
}

.dropdown-content button {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  white-space: nowrap;
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
