<template>
  <div class="flex h-screen">
    <!-- 左侧目录树 -->
    <div class="w-64 border-r">
      <FolderTree ref="folderTreeRef" @select-note="handleSelectNote" />
    </div>

    <!-- 右侧编辑区 -->
    <div class="flex-1 flex flex-col bg-base-100" v-if="currentNote">
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
        <div class="menu-bar border-b p-2">
          <button
            v-for="item in menuItems"
            :key="item.icon"
            @click="item.action"
            :class="{ 'is-active': item.isActive?.() }"
            class="btn btn-sm btn-ghost mx-1"
          >
            <span class="material-icons text-base">{{ item.icon }}</span>
          </button>
        </div>
        <editor-content :editor="editor" class="prose max-w-none p-4" />
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center">
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
import { ref, onBeforeUnmount, watch } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import markdown from "highlight.js/lib/languages/markdown";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import FolderTree from "../components/FolderTree.vue";
import type { Note } from "../types";
import { TextSelection } from "@tiptap/pm/state";

// 创建代码高亮实例并注册语言
const lowlight = createLowlight(common);
lowlight.register("javascript", javascript);
lowlight.register("js", javascript);
lowlight.register("python", python);
lowlight.register("py", python);
lowlight.register("go", go);
lowlight.register("golang", go);
lowlight.register("rust", rust);
lowlight.register("rs", rust);
lowlight.register("java", java);
lowlight.register("cpp", cpp);
lowlight.register("c++", cpp);
lowlight.register("typescript", typescript);
lowlight.register("ts", typescript);
lowlight.register("bash", bash);
lowlight.register("sh", bash);
lowlight.register("shell", bash);
lowlight.register("sql", sql);
lowlight.register("json", json);
lowlight.register("xml", xml);
lowlight.register("html", xml);
lowlight.register("yaml", yaml);
lowlight.register("yml", yaml);
lowlight.register("markdown", markdown);
lowlight.register("md", markdown);

// 当前编辑的笔记
const currentNote = ref<Note | null>(null);
const folderTreeRef = ref<InstanceType<typeof FolderTree> | null>(null);
let saveTimeout: number | null = null;

// 初始化编辑器
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
      blockquote: {
        HTMLAttributes: {
          class: "border-l-4 border-gray-300 pl-4 my-4",
        },
      },
      codeBlock: false,
    }),
    Typography,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-blue-500 hover:text-blue-700",
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: "rounded-lg shadow-lg max-w-full h-auto",
      },
    }),
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: "plaintext",
      HTMLAttributes: {
        class: "code-block-wrapper",
      },
      editable: true,
      selectable: true,
    }).extend({
      addKeyboardShortcuts() {
        return {
          "Mod-a": ({ editor }) => {
            const { state } = editor;
            const { from } = state.selection;
            const $from = state.doc.resolve(from);

            // 检查当前节点是否是代码块
            if ($from.parent.type.name === "codeBlock") {
              const start = $from.start();
              const end = $from.end();

              editor.commands.setTextSelection({ from: start, to: end });
              return true;
            }
            return false;
          },
        };
      },
      addNodeView() {
        return ({ node, getPos, editor }) => {
          const container = document.createElement("div");
          container.classList.add("code-block-wrapper");

          const toolbar = document.createElement("div");
          toolbar.classList.add("code-block-toolbar");

          // 语言选择下拉框
          const select = document.createElement("select");
          select.classList.add("language-select");

          const languages = [
            { value: "plaintext", label: "纯文本" },
            { value: "javascript", label: "JavaScript" },
            { value: "typescript", label: "TypeScript" },
            { value: "python", label: "Python" },
            { value: "go", label: "Go" },
            { value: "rust", label: "Rust" },
            { value: "java", label: "Java" },
            { value: "cpp", label: "C++" },
            { value: "bash", label: "Bash" },
            { value: "sql", label: "SQL" },
            { value: "json", label: "JSON" },
            { value: "xml", label: "XML/HTML" },
            { value: "yaml", label: "YAML" },
            { value: "markdown", label: "Markdown" },
          ];

          languages.forEach((lang) => {
            const option = document.createElement("option");
            option.value = lang.value;
            option.textContent = lang.label;
            option.selected = node.attrs.language === lang.value;
            select.appendChild(option);
          });

          select.addEventListener("change", (event) => {
            if (typeof getPos === "function") {
              editor
                .chain()
                .focus()
                .command(({ tr }) => {
                  const pos = getPos();
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    language: (event.target as HTMLSelectElement).value,
                  });
                  return true;
                })
                .run();
            }
          });

          // 创建 pre 和 code 元素
          const pre = document.createElement("pre");
          const code = document.createElement("code");
          code.classList.add(`language-${node.attrs.language || "plaintext"}`);
          pre.appendChild(code);

          // 复制按钮
          const copyButton = document.createElement("button");
          copyButton.classList.add("copy-button");
          copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            <span>复制</span>
          `;

          copyButton.addEventListener("click", () => {
            const text = code.textContent || "";
            navigator.clipboard.writeText(text).then(() => {
              copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                <span>已复制</span>
              `;
              copyButton.classList.add("copied");

              setTimeout(() => {
                copyButton.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                  <span>复制</span>
                `;
                copyButton.classList.remove("copied");
              }, 2000);
            });
          });

          // 先添加语言选择
          toolbar.appendChild(select);

          // 添加中间的空白占位
          const spacer = document.createElement("div");
          spacer.classList.add("toolbar-spacer");
          toolbar.appendChild(spacer);

          // 最后添加复制按钮
          toolbar.appendChild(copyButton);

          container.appendChild(toolbar);
          container.appendChild(pre);

          // 在创建 code 元素后添加事件监听
          code.addEventListener("keydown", (e) => {
            // 检测 Ctrl+A 或 Command+A (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === "a") {
              e.preventDefault(); // 阻止默认全选行为
              e.stopPropagation(); // 阻止事件冒泡

              // 确保焦点在代码块内
              if (document.activeElement === code) {
                // 创建范围选择
                const range = document.createRange();
                range.selectNodeContents(code);

                // 获取选区对象并应用选择
                const selection = window.getSelection();
                if (selection) {
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }
          });

          // 添加点击事件以确保代码块可以获得焦点
          code.setAttribute("tabindex", "0"); // 使元素可以获得焦点
          code.style.outline = "none"; // 去除默认的焦点轮廓

          return {
            dom: container,
            contentDOM: code,
            update: (updatedNode) => {
              if (updatedNode.type !== node.type) return false;

              if (updatedNode.attrs.language !== node.attrs.language) {
                code.className = `language-${updatedNode.attrs.language || "plaintext"}`;
                select.value = updatedNode.attrs.language || "plaintext";
              }

              return true;
            },
          };
        };
      },
    }),
    Placeholder.configure({
      placeholder:
        "开始编写你的笔记...\n\n提示：\n# 一级标题\n## 二级标题\n- 无序列表\n1. 有序列表\n> 引用文本\n```js\n代码块\n```\n--- 分隔线",
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: "border-collapse table-auto w-full",
      },
    }),
    TableRow,
    TableHeader.configure({
      HTMLAttributes: {
        class: "border border-gray-300 px-4 py-2 bg-gray-100",
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: "border border-gray-300 px-4 py-2",
      },
    }),
    TaskList.configure({
      HTMLAttributes: {
        class: "not-prose pl-2",
      },
    }),
    TaskItem.configure({
      nested: true,
    }),
    HorizontalRule.configure({
      HTMLAttributes: {
        class: "my-4 border-t border-gray-300",
      },
    }),
  ],
  editorProps: {
    attributes: {
      class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none",
    },
    handleKeyDown: (view, event) => {
      // 检查是否是 Ctrl+A/Cmd+A
      if ((event.ctrlKey || event.metaKey) && event.key === "a") {
        const { state } = view;
        const { from } = state.selection;
        const $from = state.doc.resolve(from);

        // 检查当前节点是否是代码块
        const node = $from.parent;
        if (node.type.name === "codeBlock") {
          event.preventDefault();

          // 选择整个代码块的内容
          const start = $from.start();
          const end = $from.end();

          view.dispatch(
            view.state.tr.setSelection(TextSelection.create(view.state.doc, start, end))
          );
          return true;
        }
      }
      return false;
    },
  },
  onUpdate: ({ editor }) => {
    if (currentNote.value) {
      currentNote.value.content = editor.getHTML();
      handleContentChange();
    }
  },
});

// 编辑器菜单项
const menuItems = [
  {
    icon: "format_bold",
    action: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive("bold"),
  },
  {
    icon: "format_italic",
    action: () => editor.value?.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive("italic"),
  },
  {
    icon: "format_strikethrough",
    action: () => editor.value?.chain().focus().toggleStrike().run(),
    isActive: () => editor.value?.isActive("strike"),
  },
  {
    icon: "format_list_bulleted",
    action: () => editor.value?.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive("bulletList"),
  },
  {
    icon: "format_list_numbered",
    action: () => editor.value?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive("orderedList"),
  },
  {
    icon: "title",
    action: () => {
      const level = window.prompt("输入标题级别 (1-6):", "1");
      if (level && /^[1-6]$/.test(level)) {
        const headingLevel = parseInt(level) as 1 | 2 | 3 | 4 | 5 | 6;
        editor.value?.chain().focus().toggleHeading({ level: headingLevel }).run();
      }
    },
    isActive: () =>
      [1, 2, 3, 4, 5, 6].some((level) =>
        editor.value?.isActive("heading", { level: level as 1 | 2 | 3 | 4 | 5 | 6 })
      ),
  },
  {
    icon: "code",
    action: () => {
      const languages = [
        { value: "plaintext", label: "纯文本" },
        { value: "javascript", label: "JavaScript" },
        { value: "typescript", label: "TypeScript" },
        { value: "python", label: "Python" },
        { value: "go", label: "Go" },
        { value: "rust", label: "Rust" },
        { value: "java", label: "Java" },
        { value: "cpp", label: "C++" },
        { value: "bash", label: "Bash" },
        { value: "sql", label: "SQL" },
        { value: "json", label: "JSON" },
        { value: "xml", label: "XML/HTML" },
        { value: "yaml", label: "YAML" },
        { value: "markdown", label: "Markdown" },
      ];
      const language = window.prompt(
        `输入代码语言，支持：\n${languages
          .map((lang) => `${lang.label} (${lang.value})`)
          .join("\n")}`,
        "plaintext"
      );
      if (language) {
        editor.value
          ?.chain()
          .focus()
          .toggleCodeBlock({ language: language.toLowerCase() })
          .run();
      }
    },
    isActive: () => editor.value?.isActive("codeBlock"),
  },
  {
    icon: "link",
    action: () => {
      const url = window.prompt("输入链接URL");
      if (url) {
        editor.value?.chain().focus().setLink({ href: url }).run();
      }
    },
    isActive: () => editor.value?.isActive("link"),
  },
  {
    icon: "format_quote",
    action: () => editor.value?.chain().focus().toggleBlockquote().run(),
    isActive: () => editor.value?.isActive("blockquote"),
  },
  {
    icon: "table_chart",
    action: () =>
      editor.value
        ?.chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
    isActive: () => editor.value?.isActive("table"),
  },
  {
    icon: "check_box",
    action: () => editor.value?.chain().focus().toggleTaskList().run(),
    isActive: () => editor.value?.isActive("taskList"),
  },
  {
    icon: "horizontal_rule",
    action: () => editor.value?.chain().focus().setHorizontalRule().run(),
  },
  {
    icon: "image",
    action: () => {
      const url = window.prompt("输入图片URL");
      if (url) {
        editor.value?.chain().focus().setImage({ src: url }).run();
      }
    },
  },
];

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
      alert("保存失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    alert("保存失败");
  }
};

// 处理笔记选择
const handleSelectNote = (note: Note | null) => {
  console.log("选中笔记:", note);
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
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-bar {
  display: flex;
  align-items: center;
}

.menu-bar button {
  margin-right: 0.5rem;
}

.menu-bar button.is-active {
  background-color: #e5e7eb;
}

.ProseMirror {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

.ProseMirror:focus {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* 标题样式 */
.ProseMirror h1 {
  font-size: 2.25em;
  margin-top: 0;
  margin-bottom: 0.8em;
  line-height: 1.2;
}

.ProseMirror h2 {
  font-size: 1.875em;
  margin-top: 1em;
  margin-bottom: 0.6em;
  line-height: 1.3;
}

.ProseMirror h3 {
  font-size: 1.5em;
  margin-top: 1em;
  margin-bottom: 0.6em;
  line-height: 1.4;
}

.ProseMirror h4 {
  font-size: 1.25em;
  margin-top: 1em;
  margin-bottom: 0.6em;
  line-height: 1.4;
}

.ProseMirror h5 {
  font-size: 1.125em;
  margin-top: 1em;
  margin-bottom: 0.6em;
  line-height: 1.4;
}

.ProseMirror h6 {
  font-size: 1em;
  margin-top: 1em;
  margin-bottom: 0.6em;
  line-height: 1.4;
}

/* 列表样式 */
.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.ProseMirror ul {
  list-style-type: disc;
}

.ProseMirror ul ul {
  list-style-type: circle;
}

.ProseMirror ul ul ul {
  list-style-type: square;
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror ol ol {
  list-style-type: lower-alpha;
}

.ProseMirror ol ol ol {
  list-style-type: lower-roman;
}

.ProseMirror li {
  margin: 0.2em 0;
}

/* 代码块相关样式 */
.code-block-wrapper {
  margin: 1em 0;
  background: #f8f9fa;
  border-radius: 0.5em;
  border: 1px solid #e9ecef;
  position: relative;

  pre {
    margin: 0;
    padding: 1em;
    overflow-x: auto;
    background: transparent;
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.9em;
    line-height: 1.5;
    background: none;
    padding: 0;
    border-radius: 0;
  }
}

.code-block-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em;
  background: #f1f3f5;
  border-bottom: 1px solid #e9ecef;
  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;
}

.toolbar-spacer {
  flex: 1;
}

.language-select {
  height: 1.8em;
  padding: 0 0.5em;
  border: 1px solid #ced4da;
  border-radius: 0.25em;
  background: white;
  font-size: 0.875em;
  color: #495057;
  cursor: pointer;
  min-width: 120px;

  &:hover {
    border-color: #adb5bd;
  }

  &:focus {
    outline: none;
    border-color: #4dabf7;
    box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.2);
  }
}

.copy-button {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  height: 1.8em;
  padding: 0 0.75em;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 0.25em;
  color: #495057;
  font-size: 0.875em;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 72px;
  justify-content: center;

  svg {
    width: 1em;
    height: 1em;
  }

  &:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
  }

  &.copied {
    background: #51cf66;
    border-color: #40c057;
    color: white;
  }
}

/* 代码高亮样式 */
.hljs {
  display: block;
  overflow-x: auto;
  padding: 0.5em;
  color: #333;
  background: #f5f5f5;
}

.hljs-comment,
.hljs-quote {
  color: #998;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-subst {
  color: #333;
  font-weight: bold;
}

.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable,
.hljs-tag .hljs-attr {
  color: #008080;
}

.hljs-string,
.hljs-doctag {
  color: #d14;
}

.hljs-title,
.hljs-section,
.hljs-selector-id {
  color: #900;
  font-weight: bold;
}

.hljs-subst {
  font-weight: normal;
}

.hljs-type,
.hljs-class .hljs-title {
  color: #458;
  font-weight: bold;
}

.hljs-tag,
.hljs-name,
.hljs-attribute {
  color: #000080;
  font-weight: normal;
}

.hljs-regexp,
.hljs-link {
  color: #009926;
}

.hljs-symbol,
.hljs-bullet {
  color: #990073;
}

.hljs-built_in,
.hljs-builtin-name {
  color: #0086b3;
}

.hljs-meta {
  color: #999;
  font-weight: bold;
}

.hljs-deletion {
  background: #fdd;
}

.hljs-addition {
  background: #dfd;
}

.hljs-emphasis {
  font-style: italic;
}

.hljs-strong {
  font-weight: bold;
}

.ProseMirror blockquote {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid #e5e7eb;
  color: #6b7280;
  font-style: italic;

  p {
    margin: 0;
  }
}
</style>
