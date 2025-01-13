<template>
  <div class="vditor-container" :class="{ 'narrow-layout': isNarrowLayout }">
    <div ref="vditorRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import Vditor from "vditor";
import "vditor/dist/index.css";

const props = defineProps({
  value: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["change"]);
const vditorRef = ref(null);
const isNarrowLayout = ref(true);
let vditor = null;

// 切换布局
const toggleLayout = () => {
  isNarrowLayout.value = !isNarrowLayout.value;
  if (vditor) {
    setTimeout(() => {
      vditor.resize();
    }, 0);
  }
};

onMounted(() => {
  vditor = new Vditor(vditorRef.value, {
    height: "100%",
    mode: "ir",
    theme: "classic",
    cache: {
      enable: false,
    },
    preview: {
      markdown: {
        listStyle: true,
      },
      theme: {
        current: "light",
      },
    },
    counter: {
      enable: true,
    },
    input: (value) => {
      emit("change", value);
    },
    ir: {
      list: {
        listStyle: true,
      },
    },
    outline: {
      enable: true, // 启用内置大纲
      position: "right",
    },
    toolbar: [
      "emoji",
      "headings",
      "bold",
      "italic",
      "strike",
      "link",
      "|",
      "list",
      "ordered-list",
      "check",
      "outdent",
      "indent",
      "|",
      "quote",
      "line",
      "code",
      "inline-code",
      "insert-before",
      "insert-after",
      "|",
      "upload",
      "table",
      "|",
      "undo",
      "redo",
      "|",
      {
        name: "layout",
        tip: "切换布局",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`,
        click: toggleLayout,
      },
      "|",
      "outline",
      "fullscreen",
      "preview",
    ],
    after: () => {
      vditor.setValue(props.value);
      setTimeout(() => {
        vditor.resize();
      }, 0);
    },
  });
});

watch(
  () => props.value,
  (newValue) => {
    if (vditor && newValue !== vditor.getValue()) {
      vditor.setValue(newValue);
    }
  }
);

onBeforeUnmount(() => {
  if (vditor) {
    vditor.destroy();
  }
});
</script>

<style>
.vditor-container {
  height: 100%;
  position: relative;
}

.vditor {
  height: 100% !important;
  border: none !important;
  border-radius: 8px;
  display: flex !important;
  flex-direction: column !important;
}

.vditor-content {
  height: 100% !important;
  display: flex !important;
  padding-right: 310px !important;
}

.vditor-ir {
  counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
  background-color: #ffffff !important;
  padding: 16px 32px !important;
  height: 100% !important;
  width: 100% !important;
  box-sizing: border-box !important;
  overflow: visible !important;
}

.vditor-ir pre.vditor-reset {
  overflow: visible !important;
}

/* 窄布局样式 */
.narrow-layout .vditor-ir {
  max-width: 900px !important;
  margin: 0 auto !important;
  margin-right: 310px !important;
}

/* 内容区域包装器 */
.vditor-content {
  overflow-y: auto !important;
  height: calc(100vh - 50px) !important;
  width: 100% !important;
}

/* 隐藏编辑器内部的滚动条 */
.vditor-ir::-webkit-scrollbar {
  display: none !important;
}

.vditor-reset::-webkit-scrollbar {
  display: none !important;
}

/* 自定义最右侧的滚动条样式 */
.vditor-content::-webkit-scrollbar {
  width: 5px !important;
  background: transparent !important;
}

.vditor-content::-webkit-scrollbar-track {
  background: transparent !important;
}

.vditor-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1) !important;
  border-radius: 5px !important;
  transition: all 0.2s ease !important;
}

.vditor-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2) !important;
}

.vditor-toolbar {
  background-color: #ffffff !important;
  padding: 8px !important;
  display: flex !important;
  justify-content: center !important;
  flex-wrap: wrap !important;
}

.vditor-toolbar__item {
  padding: 4px !important;
  margin: 0 2px !important;
}

.vditor-toolbar__item:hover {
  background-color: #f8f9fa !important;
  border-radius: 4px;
}

.vditor-toolbar__item svg {
  width: 16px;
  height: 16px;
  fill: #5c5955;
}

.vditor-ir {
  counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
  background-color: #ffffff !important;
  padding: 16px 32px !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
}

.vditor-ir__node {
  color: #2c2c2c !important;
}

.vditor-ir__link {
  color: #7c7c7c !important;
  text-decoration: underline;
}

.vditor-ir__blockquote {
  border-left: 4px solid #f0f0f0 !important;
  color: #666666 !important;
  background-color: #f8f9fa !important;
  padding: 1em !important;
  margin: 1em 0 !important;
}

.vditor-reset {
  background-color: transparent !important;
  padding: 0 !important;
  font-size: 16px;
  line-height: 1.6;
}

.vditor-ir pre.vditor-reset {
  background-color: transparent !important;
  padding: 0 !important;
}

.vditor-ir ol {
  list-style-type: decimal !important;
  padding-left: 2em !important;
}

.vditor-ir ul {
  list-style-type: disc !important;
  padding-left: 2em !important;
}

.vditor-ir h1,
.vditor-ir h2,
.vditor-ir h3,
.vditor-ir h4,
.vditor-ir h5,
.vditor-ir h6 {
  font-weight: 600;
  line-height: 1.25;
  margin-top: 24px;
  margin-bottom: 16px;
  color: #2c2c2c;
}

.vditor-ir h1 {
  font-size: 2em;
  padding-bottom: 0.3em;
}

.vditor-ir h2 {
  font-size: 1.5em;
  padding-bottom: 0.3em;
}

.vditor-ir h3 {
  font-size: 1.25em;
}

.vditor-ir h4 {
  font-size: 1em;
}

.vditor-ir h5 {
  font-size: 0.875em;
}

.vditor-ir h6 {
  font-size: 0.85em;
  color: #666666;
}

.vditor-ir pre {
  background-color: #f8f9fa !important;
  border-radius: 6px !important;
  padding: 16px !important;
  margin: 16px 0 !important;
}

.vditor-ir code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  background-color: #f8f9fa;
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-size: 85%;
}

.vditor-ir table {
  border-collapse: collapse;
  margin: 16px 0;
  display: block;
  overflow-x: auto;
}

.vditor-ir td,
.vditor-ir th {
  padding: 6px 13px;
  border: none;
  border-bottom: 1px solid #f0f0f0;
}

.vditor-ir tr {
  background-color: #ffffff;
}

.vditor-ir tr:nth-child(2n) {
  background-color: #f8f9fa;
}

/* 大纲固定悬浮样式 */
.vditor-outline {
  position: fixed !important;
  right: 40px !important;
  top: 60% !important;
  transform: translateY(-50%) !important;
  max-height: 70vh !important;
  min-height: 200px !important;
  height: auto !important;
  width: 250px !important;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
  z-index: 100 !important;
  padding: 16px !important;
  overflow-y: auto !important;
}

/* 大纲标题样式 */
.vditor-outline__title {
  font-size: 16px !important;
  font-weight: 600 !important;
  margin-bottom: 16px !important;
  padding-bottom: 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

/* 大纲项目样式 */
.vditor-outline__item {
  padding: 4px 8px !important;
  cursor: pointer !important;
  color: #666 !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  border-radius: 4px !important;
  margin-bottom: 2px !important;
  transition: all 0.2s !important;
}

.vditor-outline__item:hover {
  background: rgba(0, 0, 0, 0.05) !important;
  color: #333 !important;
}

.vditor-outline__item--current {
  background: rgba(0, 0, 0, 0.05) !important;
  color: #333 !important;
  font-weight: 500 !important;
}

/* 大纲滚动条样式 */
.vditor-outline::-webkit-scrollbar {
  width: 3px !important;
  height: 3px !important;
  background: transparent !important;
}

.vditor-outline::-webkit-scrollbar-track {
  background: transparent !important;
}

.vditor-outline::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08) !important;
  border-radius: 3px !important;
  transition: all 0.2s ease !important;
}

.vditor-outline::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15) !important;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 4px !important;
  height: 4px !important;
  background: transparent !important;
}

::-webkit-scrollbar-track {
  background: transparent !important;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08) !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15) !important;
}

::-webkit-scrollbar-corner {
  background: transparent !important;
}

/* 编辑器内容区域滚动条 */
.vditor-content::-webkit-scrollbar {
  width: 4px !important;
  height: 4px !important;
  background: transparent !important;
}

.vditor-content::-webkit-scrollbar-track {
  background: transparent !important;
}

.vditor-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08) !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

.vditor-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15) !important;
}

/* 大纲滚动条样式 */
.vditor-outline::-webkit-scrollbar {
  width: 3px !important;
  height: 3px !important;
  background: transparent !important;
}

.vditor-outline::-webkit-scrollbar-track {
  background: transparent !important;
}

.vditor-outline::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08) !important;
  border-radius: 3px !important;
  transition: all 0.2s ease !important;
}

.vditor-outline::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15) !important;
}

/* 代码块滚动条样式 */
.vditor-ir pre::-webkit-scrollbar,
.vditor-reset pre::-webkit-scrollbar {
  width: 4px !important;
  height: 4px !important;
  background: transparent !important;
}

.vditor-ir pre::-webkit-scrollbar-track,
.vditor-reset pre::-webkit-scrollbar-track {
  background: transparent !important;
}

.vditor-ir pre::-webkit-scrollbar-thumb,
.vditor-reset pre::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08) !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

.vditor-ir pre::-webkit-scrollbar-thumb:hover,
.vditor-reset pre::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15) !important;
}
</style>
