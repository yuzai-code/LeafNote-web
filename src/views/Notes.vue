<template>
  <div class="flex h-screen">
    <!-- 左侧目录树 -->
    <div class="w-64 border-r fixed h-screen overflow-y-auto bg-base-100">
      <FolderTree ref="folderTreeRef" @select-note="handleSelectNote" />
    </div>

    <!-- 右侧编辑区，添加左边距以避免被固定的目录树遮挡 -->
    <div class="flex-1 flex flex-col bg-base-100 ml-64" v-if="currentNote">
      <div class="p-4 border-b">
        <input
          v-model="currentNote.title"
          type="text"
          placeholder="笔记标题"
          class="input input-lg w-full"
          @blur="handleSaveNote"
        />
      </div>
      <div class="flex-1 editor-container">
        <VditorEditor :value="currentNote.content || ''" @change="handleEditorChange" />
      </div>
    </div>
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

<script setup>
import { ref } from "vue";
import FolderTree from "../components/FolderTree.vue";
import VditorEditor from "../components/VditorEditor.vue";

// 当前编辑的笔记
const currentNote = ref(null);
const folderTreeRef = ref(null);
let saveTimeout = null;

// 处理笔记选择
const handleSelectNote = (note) => {
  console.log("选中笔记:", note);
  currentNote.value = note;
};

// 处理编辑器内容变化
const handleEditorChange = (value) => {
  if (!currentNote.value) return;

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  currentNote.value.content = value;
  saveTimeout = window.setTimeout(() => {
    handleSaveNote();
  }, 1000);
};

// 保存笔记
const handleSaveNote = async () => {
  if (!currentNote.value) return;
  try {
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
      alert("保存失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    alert("保存失败");
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

<style>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  overflow: hidden;
}
</style>
