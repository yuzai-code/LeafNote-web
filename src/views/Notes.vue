<template>
  <div class="flex h-full">
    <!-- 左侧目录树 -->
    <div ref="sidebarRef" class="h-full border-r" :style="{ width: sidebarWidth + 'px' }">
      <div class="p-4">
        <FolderFree />
      </div>
    </div>

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

    <!-- 右侧笔记列表 -->
    <div class="flex-1 p-4 flex justify-center">
      <MuyaEditor />
      <div class="grid gap-4">
        <!-- 笔记卡片 -->
        <div
          v-for="note in notes"
          :key="note.id"
          class="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
        >
          <div class="card-body">
            <h2 class="card-title">{{ note.title }}</h2>
            <p class="text-sm text-base-content/70">{{ note.excerpt }}</p>
            <div class="flex justify-between items-center mt-2">
              <span class="text-xs text-base-content/50">{{ note.date }}</span>
              <div class="flex gap-2">
                <span class="badge badge-primary">{{ note.category }}</span>
                <span v-for="tag in note.tags" :key="tag" class="badge badge-ghost">{{
                  tag
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import FolderFree from "../compontents/FolderFree.vue";
import MuyaEditor from "../compontents/MuyaEditor.vue";

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

<style></style>
