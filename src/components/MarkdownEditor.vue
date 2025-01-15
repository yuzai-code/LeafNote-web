<template>
  <div ref="editorRef" class="markdown-editor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
} from '@muyajs/core'
import '@muyajs/core/lib/style.css'

const editorRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!editorRef.value) return

  // 注册插件
  Muya.use(EmojiSelector)
  Muya.use(InlineFormatToolbar)
  Muya.use(ImageToolBar)
  Muya.use(ImageResizeBar)
  Muya.use(CodeBlockLanguageSelector)
  Muya.use(ParagraphFrontButton)
  Muya.use(ParagraphFrontMenu)
  Muya.use(TableColumnToolbar)
  Muya.use(ParagraphQuickInsertMenu)
  Muya.use(TableDragBar)
  Muya.use(TableRowColumMenu)
  Muya.use(PreviewToolBar)

  // 初始化编辑器
  const muya = new Muya(editorRef.value, {
    markdown: '# 欢迎使用 Markdown 编辑器\n\n开始编写你的文档吧！',
  })

  // 设置中文语言
  muya.locale(zh)

  // 初始化
  muya.init()
})
</script>

<style scoped>
.markdown-editor {
  margin: 0 auto;
  max-width: 800px;
  min-height: 600px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 