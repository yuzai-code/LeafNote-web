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
      <div class="col-span-1">></div>
    </div>

    <!-- 原始 HTML -->
    <div class="mt-4">
      <h2 class="text-xl font-bold mb-2">原始 HTML</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
const handleSave = (content: string): void => {
  console.log("保存内容:", content);
};
</script>
