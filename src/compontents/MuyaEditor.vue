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

onMounted(() => {
  if (!editorRef.value) return;

  editor = new Muya(editorRef.value, {
    markdown: props.modelValue || "",
    spellcheckEnabled: props.spellcheck ?? false,
    autoFocus: props.autoFocus ?? false,
    preferLooseListItem: true,
    hideSuggest: false,
  });

  // 设置中文语言
  editor.locale(zh);

  // 初始化编辑器
  editor.init();

  // 监听事件
  editor.on("change", () => {
    const content = editor?.getMarkdown() || "";
    emit("update:modelValue", content);
    emit("change", content);
  });

  editor.on("focus", () => {
    emit("focus");
  });

  editor.on("blur", () => {
    emit("blur");
  });
});

// 监听 modelValue 的变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && newValue !== editor.getMarkdown()) {
      editor.setContent(newValue || "");
    }
  }
);

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy();
    editor = null;
  }
});

// 暴露更新内容的方法
const setContent = (content: string) => {
  if (editor) {
    editor.setContent(content);
  }
};

// 暴露获取内容的方法
const getContent = () => {
  return editor?.getMarkdown() || "";
};

// 暴露获取 HTML 的方法
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
