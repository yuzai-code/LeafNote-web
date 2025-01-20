<template>
  <div class="muya-editor-container">
    <div ref="editorRef" class="muya-editor"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
  CodeBlockLanguageSelector,
  EmojiSelector,
  ImageResizeBar,
  ImageToolBar,
  InlineFormatToolbar,
  Muya,
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

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
}>();

const editorRef = ref<HTMLElement | null>(null);
const editor = ref<Muya | null>(null);

// 初始化编辑器
const initEditor = () => {
  if (!editorRef.value) return;

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

  editor.value = new Muya(editorRef.value, {
    markdown: props.modelValue || "",
  });

  // 设置中文语言
  editor.value.locale(zh);

  // 监听内容变化
  editor.value.on("change", () => {
    const markdown = editor.value?.markdown();
    if (markdown !== undefined) {
      emit("update:modelValue", markdown);
      emit("change", markdown);
    }
  });

  // 初始化
  editor.value.init();
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value && newValue !== editor.value.markdown()) {
      editor.value.markdown(newValue);
    }
  }
);

onMounted(() => {
  initEditor();
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

// 暴露编辑器实例
defineExpose({
  editor,
});
</script>

<style>
.muya-editor-container {
  @apply h-full w-full;
}

.muya-editor {
  @apply h-full w-full p-4 bg-white;
}
</style>
