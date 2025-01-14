<template>
  <div class="flex h-screen">
    <!-- 左侧目录树 -->
    <div class="w-64 border-r fixed h-screen overflow-y-auto bg-base-100">
      <FolderTree ref="folderTreeRef" @select-note="handleSelectNote" />
    </div>

    <!-- 右侧编辑区 -->
    <div class="flex-1 flex flex-col bg-base-100 ml-64" v-if="currentNote">
      <!-- 标题栏 -->
      <div class="p-4 border-b">
        <input
          v-model="currentNote.title"
          type="text"
          placeholder="笔记标题"
          class="input input-lg w-full"
          @blur="handleSaveNote"
        />
      </div>

      <!-- 工具栏 -->
      <div class="border-b p-2 flex gap-2">
        <button
          v-for="item in toolbarItems"
          :key="item.name"
          class="btn btn-sm"
          :class="{ 'btn-active': item.isActive?.() }"
          @click="item.action"
        >
          {{ item.label }}
        </button>
      </div>

      <!-- 编辑器容器 -->
      <div class="flex-1 overflow-auto">
        <editor-content :editor="editor" class="prose max-w-none p-4" />
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
import { ref, onBeforeUnmount, watch, computed } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import FolderTree from "../components/FolderTree.vue";
import type { Note } from "../types";

// 当前编辑的笔记
const currentNote = ref<Note | null>(null);
const folderTreeRef = ref<InstanceType<typeof FolderTree> | null>(null);

// 防抖保存
let saveTimeout: number | null = null;

// 初始化编辑器
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    Placeholder.configure({
      placeholder:
        "开始编写你的笔记...\n\n提示：\n# 一级标题\n## 二级标题\n- 无序列表\n1. 有序列表\n> 引用文本\n```js\n代码块\n```",
    }),
  ],
  editorProps: {
    attributes: {
      class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none",
    },
  },
  onUpdate: ({ editor }) => {
    if (currentNote.value) {
      currentNote.value.content = editor.getHTML();
      handleContentChange();
    }
  },
});

// 工具栏配置
const toolbarItems = computed(() => [
  {
    name: "h1",
    label: "H1",
    action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 1 }),
  },
  {
    name: "h2",
    label: "H2",
    action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value?.isActive("heading", { level: 2 }),
  },
  {
    name: "bold",
    label: "粗体",
    action: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive("bold"),
  },
  {
    name: "italic",
    label: "斜体",
    action: () => editor.value?.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive("italic"),
  },
  {
    name: "bulletList",
    label: "无序列表",
    action: () => editor.value?.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive("bulletList"),
  },
  {
    name: "orderedList",
    label: "有序列表",
    action: () => editor.value?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive("orderedList"),
  },
  {
    name: "blockquote",
    label: "引用",
    action: () => editor.value?.chain().focus().toggleBlockquote().run(),
    isActive: () => editor.value?.isActive("blockquote"),
  },
  {
    name: "code",
    label: "代码块",
    action: () => editor.value?.chain().focus().toggleCodeBlock().run(),
    isActive: () => editor.value?.isActive("codeBlock"),
  },
]);

// 监听笔记变化，更新编辑器内容
watch(currentNote, (newNote) => {
  if (newNote && editor.value) {
    editor.value.commands.setContent(newNote.content || "");
  }
});

// 自动保存防抖
const handleContentChange = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
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
      throw new Error("保存失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    alert("保存失败");
  }
};

// 处理笔记选择
const handleSelectNote = (note: Note | null) => {
  currentNote.value = note;
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

// 组件销毁时清理编辑器
onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style lang="scss">
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0d0d0d;
    color: #fff;
    font-family: "JetBrainsMono", monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0d0d0d, 0.1);
  }

  hr {
    border: none;
    border-top: 2px solid rgba(#0d0d0d, 0.1);
    margin: 2rem 0;
  }
}
</style>
