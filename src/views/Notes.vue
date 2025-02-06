<template>
  <div class="flex h-full">
    <!-- 左侧目录树 -->
    <aside
      class="bg-base-100 h-full flex flex-col"
      :style="{ width: sidebarWidth + 'px' }"
    >
      <div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-container">
        <div class="h-full">
          <FolderFree 
            @select-note="handleSelectNote"
            @select-folder="handleFolderSelect"
          />
        </div>
      </div>
    </aside>

    <!-- 分割线 -->
    <div
      class="w-1 hover:bg-primary/20 cursor-col-resize relative group"
      @mousedown="startResize"
    >
      <!-- 拖动时的视觉提示 -->
      <div
        class="absolute inset-y-0 w-1 bg-primary/0 group-hover:bg-primary/20 transition-colors"
      ></div>
    </div>

    <!-- 右侧内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 笔记编辑器 -->
      <template v-if="currentNote">
        <div class="border-b">
          <div class="max-w-[800px] mx-auto px-[50px] py-4">
            <div class="relative group w-full">
              <input
                v-if="isEditing"
                v-model="editingTitle"
                class="input input-bordered w-full text-xl font-bold"
                @blur="handleRename"
                @keyup.enter="handleRename"
                @keyup.esc="cancelRename"
                ref="titleInputRef"
              />
              <h1
                v-else
                class="text-xl font-bold cursor-pointer group-hover:bg-base-200 rounded px-2 py-1"
                @click="startRename"
              >
                {{ currentNote.title }}
              </h1>
            </div>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto scrollbar-container">
          <MuyaEditor
            ref="editorRef"
            v-model="editorContent"
            :autoFocus="true"
            @change="handleEditorChange"
          />
        </div>
      </template>
      
      <!-- 笔记卡片列表 -->
      <template v-else>
        <div class="flex-1 overflow-y-auto scrollbar-container">
          <NoteCards
            :folder="currentFolder"
            :notes="folderNotes"
            :loading="loading"
            @select-note="handleSelectNote"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick, computed } from "vue";
import FolderFree from "../compontents/FolderFree.vue";
import MuyaEditor from "../compontents/MuyaEditor.vue";
import NoteCards from "../compontents/NoteCards.vue";
import { Note, Category } from "../api/types";
import { ApiService } from "../api/index";

const SIDEBAR_WIDTH_KEY = "leafnote-sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 600;

// 从 localStorage 获取保存的宽度，如果没有则使用默认值
const getSavedWidth = (): number => {
  const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
  if (saved) {
    const width = parseInt(saved);
    return Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH);
  }
  return DEFAULT_WIDTH;
};

// 侧边栏宽度状态
const sidebarWidth = ref(getSavedWidth());
const isResizing = ref(false);
const startX = ref(0);
const startWidth = ref(0);

// 开始调整大小
const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  startX.value = e.clientX;
  startWidth.value = sidebarWidth.value;
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", stopResize);
};

// 处理鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (!isResizing.value) return;

  const diff = e.clientX - startX.value;
  const newWidth = startWidth.value + diff;

  // 限制最小和最大宽度
  sidebarWidth.value = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
  // 保存新的宽度到 localStorage
  localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.value.toString());
};

// 停止调整大小
const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", stopResize);
};

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", stopResize);
});

// 编辑器相关状态
const editorRef = ref();
const editorContent = ref("");
const currentNote = ref<Note | null>(null);
const saveTimeout = ref<number | null>(null);

// 标题编辑相关状态
const isEditing = ref(false);
const editingTitle = ref('');
const titleInputRef = ref<HTMLInputElement | null>(null);

// 开始重命名
const startRename = () => {
  if (!currentNote.value) return;
  isEditing.value = true;
  editingTitle.value = currentNote.value.title;
  nextTick(() => {
    if (titleInputRef.value) {
      titleInputRef.value.focus();
      titleInputRef.value.select();
    }
  });
};

// 取消重命名
const cancelRename = () => {
  isEditing.value = false;
  if (currentNote.value) {
    editingTitle.value = currentNote.value.title;
  }
};

// 处理重命名
const handleRename = async () => {
  if (!currentNote.value || !editingTitle.value.trim()) {
    cancelRename();
    return;
  }

  const newTitle = editingTitle.value.trim();
  if (newTitle === currentNote.value.title) {
    cancelRename();
    return;
  }

  try {
    await ApiService.updateNote(currentNote.value.id, {
      ...currentNote.value,
      title: newTitle
    });
    currentNote.value.title = newTitle;
    isEditing.value = false;
  } catch (err) {
    console.error("重命名失败:", err);
  }
};

// 处理笔记选择
const handleSelectNote = async (note: Note) => {
  try {
    // 获取完整的笔记内容
    const fullNote = await ApiService.getNoteById(note.id);
    currentNote.value = fullNote;
    editorContent.value = fullNote.content;

    // 更新编辑器内容
    const editor = editorRef.value;
    if (editor) {
      editor.setContent(fullNote.content);
    }
  } catch (err) {
    console.error("获取笔记内容失败:", err);
  }
};

// 处理编辑器内容变化
const handleEditorChange = async (content: string) => {
  if (!currentNote.value) return;

  // 清除之前的定时器
  if (saveTimeout.value) {
    clearTimeout(saveTimeout.value);
  }

  // 更新当前笔记的内容
  currentNote.value.content = content;

  // 设置新的定时器，延迟保存
  saveTimeout.value = window.setTimeout(async () => {
    try {
      await ApiService.updateNote(currentNote.value!.id, {
        content: currentNote.value!.content,
        title: currentNote.value!.title,
      });
    } catch (err) {
      console.error("保存笔记失败:", err);
    }
  }, 1000); // 1秒后自动保存
};

// 组件卸载时清理
onUnmounted(() => {
  if (saveTimeout.value) {
    clearTimeout(saveTimeout.value);
  }
});

// 当前目录状态
const currentFolder = ref<Category | null>(null);
const folderNotes = ref<Note[] | null>(null);
const loading = ref(false);

// 处理目录选择
const handleFolderSelect = async (folder: Category) => {
  console.log('选择目录:', folder); // 添加日志
  try {
    // 清空当前笔记
    currentNote.value = null;
    editorContent.value = '';
    
    // 设置当前目录
    currentFolder.value = folder;
    
    // 开始加载
    loading.value = true;

    // 直接使用目录中的笔记数据
    folderNotes.value = folder.notes || [];
    console.log('目录笔记:', folderNotes.value); // 添加日志
  } catch (err) {
    console.error("获取目录笔记失败:", err);
    folderNotes.value = null;
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
/* 自定义滚动条样式 */
.scrollbar-container {
  scrollbar-width: thin;
}

.scrollbar-container::-webkit-scrollbar {
  width: 4px;
  height: 0;
  display: none;
}

.scrollbar-container:hover::-webkit-scrollbar {
  display: block;
}

.scrollbar-container::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.scrollbar-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
