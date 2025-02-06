<template>
  <div class="muya-editor-container" ref="editorContainer">
    <div class="muya-editor" ref="editorRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
  Muya,
  CodeBlockLanguageSelector,
  EmojiSelector,
  ImageResizeBar,
  ImageToolBar,
  InlineFormatToolbar,
  ParagraphFrontButton,
  ParagraphFrontMenu,
  ParagraphQuickInsertMenu,
  PreviewToolBar,
  TableColumnToolbar,
  TableDragBar,
  TableRowColumMenu,
  zh,
} from "@muyajs/core";

import "@muyajs/core/lib/style.css";

// 注册插件
Muya.use(EmojiSelector);
Muya.use(InlineFormatToolbar);
Muya.use(ImageToolBar);
Muya.use(ImageResizeBar);
Muya.use(CodeBlockLanguageSelector);
Muya.use(ParagraphFrontButton);
Muya.use(ParagraphFrontMenu);
Muya.use(TableColumnToolbar);
Muya.use(ParagraphQuickInsertMenu);
Muya.use(TableDragBar);
Muya.use(TableRowColumMenu);
Muya.use(PreviewToolBar);

const editorRef = ref<HTMLElement>();
const editorContainer = ref<HTMLElement>();
let editor: Muya | null = null;
let isUpdating = false;
let lastContent = ""; // 用于追踪最后一次内容

const props = defineProps<{
  modelValue?: string;
  spellcheck?: boolean;
  autoFocus?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
  (e: "focus"): void;
  (e: "blur"): void;
}>();

// 添加防抖函数
const debounce = (fn: Function, delay: number) => {
  let timer: number | null = null;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
};

// 内容更新函数
const updateContent = () => {
  if (!editor) return;
  const content = editor.getMarkdown();
  if (content !== lastContent) {
    lastContent = content;
    emit("update:modelValue", content);
    emit("change", content);
  }
};

onMounted(() => {
  if (!editorRef.value) return;

  editor = new Muya(editorRef.value, {
    markdown: props.modelValue || "",
  });

  lastContent = props.modelValue || "";
  editor.locale(zh);
  editor.init();

  // 使用防抖处理内容更新
  const handleContentChange = debounce(() => {
    if (!editor) return;
    updateContent();
  }, 100);

  // 监听所有可能导致内容变化的事件
  editor.on("text-change", handleContentChange);
  editor.on("json-change", handleContentChange);

  editor.on("focus", () => {
    emit("focus");
  });

  editor.on("blur", () => {
    // 在失焦时立即同步一次内容，确保保存最新状态
    updateContent();
    emit("blur");
  });
});

// 优化 watch 逻辑
watch(
  () => props.modelValue,
  (newValue) => {
    if (!editor || isUpdating) return;

    const currentContent = editor.getMarkdown();
    if (newValue !== currentContent) {
      isUpdating = true;
      lastContent = newValue || "";
      editor.setContent(newValue || "");
      setTimeout(() => {
        isUpdating = false;
      }, 10);
    }
  }
);

onBeforeUnmount(() => {
  if (editor) {
    // 在组件卸载前确保同步最后的内容
    updateContent();
    editor.destroy();
    editor = null;
  }
});

// 暴露更新内容的方法
const setContent = (content: string) => {
  if (editor) {
    isUpdating = true;
    lastContent = content;
    editor.setContent(content);
    setTimeout(() => {
      isUpdating = false;
      updateContent();
    }, 10);
  }
};

const getContent = () => {
  return editor?.getMarkdown() || "";
};

const getMarkdownHtml = () => {
  return editor?.getMarkdown() || "";
};

defineExpose({
  setContent,
  getContent,
  getMarkdownHtml,
  editor: () => editor,
});
</script>

<style scoped>
.muya-editor-container {
  @apply w-full h-full overflow-auto relative;
}

.muya-editor {
  @apply min-h-full p-4;
}

:deep(.ag-gray) {
  background-color: transparent !important;
}

/* 自定义主题样式 */
:deep(.mu-gray) {
  --themeColor: #2196f3;
  --highlightColor: #2196f3;
  --selectionColor: rgba(33, 150, 243, 0.2);
  --editorColor: #424242;
  --editorColor30: rgba(66, 66, 66, 0.3);
  --editorColor50: rgba(66, 66, 66, 0.5);
  --editorColor70: rgba(66, 66, 66, 0.7);
  --editorBgColor: #ffffff;
  --deleteColor: #ff6b6b;
  --iconColor: #424242;
  --codeBgColor: #f5f5f5;
  --codeBlockBgColor: #f5f5f5;
  --inputBgColor: #f5f5f5;
  --buttonBgColor: #f5f5f5;
  --buttonColor: #424242;
  --buttonHoverColor: #2196f3;
  --buttonHoverBgColor: #e3f2fd;
  --buttonBorderColor: #e0e0e0;
  --buttonShadow: none;
  --buttonHoverShadow: none;
  --scrollbarThumbBgColor: rgba(66, 66, 66, 0.2);
  --scrollbarThumbHoverBgColor: rgba(66, 66, 66, 0.3);
  --maskColor: rgba(255, 255, 255, 0.7);
}
</style>
