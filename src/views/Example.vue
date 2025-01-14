<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Markdown 编辑器示例</h1>

    <div class="grid grid-cols-2 gap-4">
      <!-- 编辑器 -->
      <div class="col-span-1">
        <h2 class="text-xl font-bold mb-2">编辑区域</h2>
        <MarkdownEditor
          v-model:content="content"
          placeholder="开始编写你的 Markdown..."
          @save="handleSave"
        />
      </div>

      <!-- 预览 -->
      <div class="col-span-1">
        <h2 class="text-xl font-bold mb-2">HTML 预览</h2>
        <div
          class="border rounded-lg p-4 prose max-w-none h-[500px] overflow-auto"
          v-html="content"
        />
      </div>
    </div>

    <!-- 原始 HTML -->
    <div class="mt-4">
      <h2 class="text-xl font-bold mb-2">原始 HTML</h2>
      <pre class="border rounded-lg p-4 bg-gray-50 overflow-auto">{{ content }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
import MarkdownEditor from "../components/MarkdownEditor/index.vue";

const content: Ref<string> = ref(`# 欢迎使用 Markdown 编辑器

这是一个基于 Tiptap 的 **Markdown 编辑器**示例。

## 功能特点

1. 实时预览
2. 语法高亮
3. 图片上传
4. 快捷键支持

### 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

> 这是一个引用示例

- [ ] 待办事项 1
- [x] 已完成事项`);

const handleSave = (content: string): void => {
  console.log("保存内容:", content);
};
</script>
