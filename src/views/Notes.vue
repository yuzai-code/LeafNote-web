<template>
  <div class="flex h-screen">
    <!-- 左侧目录树 -->
    <div class="w-64 border-r fixed h-screen overflow-y-auto bg-base-100">
      <FolderTree ref="folderTreeRef" @select-note="handleSelectNote" />
    </div>

    <!-- 右侧编辑区 -->
    <div class="flex-1 flex flex-col bg-base-100 ml-64" v-if="currentNote">
      <!-- 标题栏 -->
      <div class="border-b">
        <div :class="{ 'max-w-3xl mx-auto px-8': !isWideLayout, 'px-4': isWideLayout }">
          <div class="py-4 flex items-center justify-between">
            <input
              v-model="currentNote.title"
              type="text"
              placeholder="笔记标题"
              class="input input-lg flex-1"
              @blur="handleSaveNote"
            />
            <div class="ml-4 flex items-center gap-4">
              <button
                class="btn btn-ghost btn-sm"
                :class="{ 'btn-active': isWideLayout }"
                @click="isWideLayout = !isWideLayout"
                title="切换宽窄布局"
              >
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
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              </button>
              <div class="text-sm text-gray-500">
                <span v-if="isSaving">正在保存...</span>
                <span v-else-if="lastSaveTime">
                  最后保存于 {{ new Date(lastSaveTime).toLocaleTimeString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑器容器 -->
      <div class="flex-1 overflow-auto">
        <div
          :class="{
            'max-w-3xl mx-auto px-8 w-full': !isWideLayout,
            'px-4 w-full': isWideLayout,
          }"
        >
          <MarkdownEditor
            ref="editorRef"
            v-model="currentNote.content"
            @update:modelValue="handleContentChange"
          />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex items-center justify-center ml-64">
      <div class="text-center">
        <h3 class="text-lg font-bold mb-4">选择或创建一个笔记开始编辑</h3>
        <button class="btn btn-primary" @click="handleCreateNote">
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          新建笔记
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FolderTree from "../components/FolderTree.vue";
import MarkdownEditor from "../components/MarkdownEditor/index.vue";
import type { Note } from "../types";

// 当前编辑的笔记
const currentNote = ref<Note | null>(null);
const folderTreeRef = ref<InstanceType<typeof FolderTree> | null>(null);
const editorRef = ref<InstanceType<typeof MarkdownEditor> | null>(null);

// 编辑器布局状态
const isWideLayout = ref(false);

// 保存状态
const isSaving = ref(false);
const lastSaveTime = ref<Date | null>(null);

// 防抖保存
let saveTimeout: number | null = null;

// 自动保存防抖
const handleContentChange = (content: string) => {
  if (currentNote.value) {
    currentNote.value.content = content;
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = window.setTimeout(async () => {
      await handleSaveNote();
    }, 1000);
  }
};

// 保存笔记
const handleSaveNote = async () => {
  if (!currentNote.value) return;
  try {
    isSaving.value = true;
    const response = await fetch(`/api/v1/notes/${currentNote.value.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: currentNote.value.title,
        content: currentNote.value.content,
      }),
    });
    if (!response.ok) {
      throw new Error("保存失败");
    }
    lastSaveTime.value = new Date();
  } catch (error) {
    console.error("保存失败:", error);
    alert("保存失败");
  } finally {
    isSaving.value = false;
  }
};

// 处理笔记选择
const handleSelectNote = async (note: Note | null) => {
  if (!note) {
    currentNote.value = null;
    return;
  }

  try {
    const response = await fetch(`/api/v1/notes/${note.id}`);
    if (!response.ok) {
      throw new Error("获取笔记内容失败");
    }
    const fullNote = await response.json();
    currentNote.value = fullNote;
    lastSaveTime.value = null; // 重置保存状态
  } catch (error) {
    console.error("获取笔记内容失败:", error);
    alert("获取笔记内容失败");
    currentNote.value = null;
  }
};

// 处理新建笔记
const handleCreateNote = async () => {
  const currentFolder = folderTreeRef.value?.getCurrentFolder();
  if (!currentFolder) {
    alert("请先选择一个目录");
    return;
  }

  try {
    const defaultTitle = "新建笔记";
    const filePath = `${currentFolder.path}/${defaultTitle}.md`;

    const response = await fetch("/api/v1/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: defaultTitle,
        content: "",
        category_id: currentFolder.id,
        file_path: filePath,
        tag_ids: [],
      }),
    });

    if (!response.ok) {
      throw new Error("创建笔记失败");
    }

    const newNote = await response.json();
    currentNote.value = newNote;

    // 刷新目录树
    await folderTreeRef.value?.handleFolderClick(currentFolder);
  } catch (error) {
    console.error("创建笔记失败:", error);
    alert("创建笔记失败");
  }
};
</script>
