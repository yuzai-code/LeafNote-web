<template>
  <div class="folder-tree">
    <!-- 当前目录项 -->
    <div
      class="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg cursor-pointer"
      :class="{
        'pl-[calc(12px*var(--depth,1))]': folder.path.split('/').length - 1,
      }"
      :style="{ '--depth': folder.path.split('/').length - 1 }"
      @click="toggleFolder"
    >
      <div class="flex items-center gap-2 flex-1">
        <!-- 展开/折叠图标 -->
        <svg
          v-if="hasChildren"
          class="w-3.5 h-3.5 transition-transform"
          :class="{ 'rotate-90': folder.expanded }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <div v-else class="w-3.5"></div>
        <!-- 文件夹图标 -->
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <!-- 目录名称/重命名输入框 -->
        <div class="flex-1">
          <input
            v-if="folder.isEditing"
            :ref="(el) => setInputRef(el, folder.id)"
            v-model="folder.editingName"
            class="input input-sm input-bordered w-full"
            @blur="handleRename"
            @keyup.enter="handleRename"
            @keyup.esc="cancelRename"
            @click.stop
          />
          <span v-else class="text-sm">{{ folder.name }}</span>
        </div>
      </div>
      <div @click.stop>
        <FolderItem
          @create-note="handleCreateNote"
          @create-folder="handleCreateFolder"
          @rename="startRename"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- 子目录和笔记 -->
    <div v-if="folder.expanded" class="mt-1">
      <!-- 递归渲染子目录 -->
      <template v-if="folder.children?.length">
        <TreeFolder
          v-for="child in folder.children"
          :key="child.id"
          :folder="child"
          @select-note="(note) => emit('select-note', note)"
          @create-note="(folder) => emit('create-note', folder)"
          @create-folder="(folder) => emit('create-folder', folder)"
          @rename-folder="(folder) => emit('rename-folder', folder)"
          @delete-folder="(folder) => emit('delete-folder', folder)"
          @select-folder="(folder) => emit('select-folder', folder)"
        />
      </template>

      <!-- 显示笔记 -->
      <template v-if="folder.notes?.length">
        <div
          v-for="note in folder.notes"
          :key="note.id"
          class="cursor-pointer"
          @click="handleNoteClick(note)"
        >
          <div
            class="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg"
            :class="{
              'pl-[calc(12px*var(--depth,1))]': folder.path.split('/').length,
            }"
            :style="{ '--depth': folder.path.split('/').length }"
          >
            <div class="flex items-center gap-2 flex-1">
              <div class="w-4"></div>
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span class="text-sm flex-1">{{ note.title }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import type { Note } from '../api/types';
import type { CategoryWithState } from '../api/types';
import FolderItem from './FolderItem.vue';

const props = defineProps<{
  folder: CategoryWithState;
}>();

const emit = defineEmits<{
  (e: 'select-note', note: Note): void;
  (e: 'create-note', folder: CategoryWithState): void;
  (e: 'create-folder', folder: CategoryWithState): void;
  (e: 'rename-folder', folder: CategoryWithState): void;
  (e: 'delete-folder', folder: CategoryWithState): void;
  (e: 'select-folder', folder: CategoryWithState): void;
}>();

// 计算是否有子元素（子目录或笔记）
const hasChildren = computed(() => {
  return Boolean(props.folder.children?.length || props.folder.notes?.length);
});

// 切换文件夹展开/折叠状态
const toggleFolder = () => {
  props.folder.expanded = !props.folder.expanded;
  // 每次点击都触发目录选择事件
  emit('select-folder', props.folder);
};

// 处理笔记点击
const handleNoteClick = (note: Note) => {
  emit('select-note', note);
};

// 设置输入框引用
const setInputRef = (el: any, id: string) => {
  if (el) {
    el.focus();
    el.select();
  }
};

// 开始重命名
const startRename = () => {
  props.folder.isEditing = true;
  props.folder.editingName = props.folder.name;
};

// 取消重命名
const cancelRename = () => {
  props.folder.isEditing = false;
  props.folder.editingName = props.folder.name;
};

// 处理重命名
const handleRename = () => {
  if (props.folder.editingName?.trim() && props.folder.editingName !== props.folder.name) {
    emit('rename-folder', props.folder);
  }
  props.folder.isEditing = false;
};

// 处理新建笔记
const handleCreateNote = () => {
  console.log('在目录下创建笔记:', props.folder);
  // 直接传递当前目录
  emit('create-note', props.folder);
};

// 处理新建目录
const handleCreateFolder = () => {
  emit('create-folder', props.folder);
};

// 处理删除
const handleDelete = () => {
  emit('delete-folder', props.folder);
};

// 处理目录点击
const handleFolderClick = (folder: CategoryWithState) => {
  emit('select-folder', folder);
};

// 组件挂载时获取数据
</script>

<style scoped>
.folder-tree {
  width: 100%;
}
</style> 