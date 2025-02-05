<template>
  <div class="flex h-full">
    <!-- 左侧目录树 -->
    <aside
      class="bg-base-100 h-full flex flex-col"
      :style="{ width: sidebarWidth + 'px' }"
    >
      <div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-container">
        <div class="h-full">
          <FolderFree @select-note="handleSelectNote" />
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

    <!-- 右侧编辑器 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 笔记标题 -->
      <div v-if="currentNote" class="p-4 border-b">
        <h1 class="text-xl font-bold">{{ currentNote.title }}</h1>
      </div>
      <!-- 编辑器 -->
      <div class="flex-1 overflow-y-auto scrollbar-container">
        <MuyaEditor
          ref="editorRef"
          v-model="editorContent"
          :autoFocus="true"
          @change="handleEditorChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import FolderFree from "../compontents/FolderFree.vue";
import MuyaEditor from "../compontents/MuyaEditor.vue";
import { Note } from "../api/types";
import { ApiService } from "../api";

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
const sidebarRef = ref<HTMLElement | null>(null);
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

// 模拟笔记数据
const notes = [
  {
    id: 1,
    title: "Vue3 组合式 API 学习笔记",
    excerpt:
      "组合式 API 是 Vue3 中一个重要的新特性，它允许我们使用函数式的方式来组织组件的逻辑...",
    date: "2024-03-15",
    category: "前端开发",
    tags: ["Vue3", "JavaScript"],
  },
  {
    id: 2,
    title: "Rust 内存管理详解",
    excerpt: "Rust 的所有权系统是其最独特的特性之一，它保证了内存安全而无需垃圾回收...",
    date: "2024-03-14",
    category: "系统编程",
    tags: ["Rust", "内存管理"],
  },
  {
    id: 3,
    title: "Docker 容器化实践",
    excerpt: "本文记录了在实际项目中使用 Docker 进行应用容器化的经验和最佳实践...",
    date: "2024-03-13",
    category: "运维",
    tags: ["Docker", "DevOps"],
  },
  {
    id: 4,
    title: "TypeScript 高级类型系统",
    excerpt:
      "TypeScript 的类型系统非常强大，本文深入探讨了泛型、映射类型和条件类型等高级特性...",
    date: "2024-03-12",
    category: "编程语言",
    tags: ["TypeScript", "类型系统"],
  },
  {
    id: 5,
    title: "Redis 性能优化技巧",
    excerpt: "通过实际案例分析 Redis 的性能瓶颈，并提供具体的优化方案...",
    date: "2024-03-11",
    category: "数据库",
    tags: ["Redis", "性能优化"],
  },
];
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
