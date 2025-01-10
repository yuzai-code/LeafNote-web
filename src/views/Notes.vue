<template>
  <div class="flex h-screen">
    <!-- 左侧目录树 -->
    <div class="w-64 border-r">
      <FolderTree 
        ref="folderTreeRef"
        @select-note="handleSelectNote" 
      />
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
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          新建笔记
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import FolderTree from '../components/FolderTree.vue'
import type { Note } from '../types'

// 创建代码高亮实例并注册语言
const lowlight = createLowlight(common)
lowlight.register('javascript', javascript)
lowlight.register('js', javascript)
lowlight.register('python', python)
lowlight.register('py', python)
lowlight.register('go', go)
lowlight.register('golang', go)
lowlight.register('rust', rust)
lowlight.register('rs', rust)
lowlight.register('java', java)
lowlight.register('cpp', cpp)
lowlight.register('c++', cpp)
lowlight.register('typescript', typescript)
lowlight.register('ts', typescript)
lowlight.register('bash', bash)
lowlight.register('sh', bash)
lowlight.register('shell', bash)
lowlight.register('sql', sql)
lowlight.register('json', json)
lowlight.register('xml', xml)
lowlight.register('html', xml)
lowlight.register('yaml', yaml)
lowlight.register('yml', yaml)
lowlight.register('markdown', markdown)
lowlight.register('md', markdown)

// 当前编辑的笔记
const currentNote = ref<Note | null>(null)
const folderTreeRef = ref<InstanceType<typeof FolderTree> | null>(null)
let saveTimeout: number | null = null

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
      // 禁用默认的代码块，使用 CodeBlockLowlight 代替
      codeBlock: false,
    }),
    TextStyle,
    Underline,
    Typography,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-500 hover:text-blue-700',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg shadow-lg max-w-full h-auto',
      },
    }),
    CodeBlockLowlight.extend({
      addNodeView() {
        return ({ node, HTMLAttributes }) => {
          const container = document.createElement('pre')
          const language = node.attrs.language || 'plaintext'
          container.setAttribute('data-language', language)
          
          const copyButton = document.createElement('button')
          copyButton.textContent = '复制'
          copyButton.type = 'button'
          container.appendChild(copyButton)
          
          const code = document.createElement('code')
          code.className = `language-${language}`
          container.appendChild(code)
          
          return {
            dom: container,
            contentDOM: code,
          }
        }
      },
    }).configure({
      lowlight,
      defaultLanguage: 'plaintext',
      HTMLAttributes: {
        class: 'rounded-md bg-gray-100 p-4',
      },
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      languageClassPrefix: 'language-'
    }),
    Placeholder.configure({
      placeholder: '开始编写你的笔记...\n\n提示：\n# 一级标题\n## 二级标题\n- 无序列表\n1. 有序列表\n> 引用文本\n```js\n代码块\n```\n--- 分隔线',
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'border-collapse table-auto w-full',
      },
    }),
    TableRow,
    TableHeader.configure({
      HTMLAttributes: {
        class: 'border border-gray-300 px-4 py-2 bg-gray-100',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: 'border border-gray-300 px-4 py-2',
      },
    }),
    TaskList.configure({
      HTMLAttributes: {
        class: 'not-prose pl-2',
      },
    }),
    TaskItem.configure({
      nested: true,
    }),
    HorizontalRule.configure({
      HTMLAttributes: {
        class: 'my-4 border-t border-gray-300',
      },
    }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
    handleClick: (view, pos, event) => {
      // 处理代码块复制按钮点击
      const target = event.target as HTMLElement
      if (target.tagName === 'BUTTON' && target.closest('pre')) {
        const pre = target.closest('pre')
        if (!pre) return false
        const code = pre.querySelector('code')
        if (!code) return false
        
        // 复制代码
        navigator.clipboard.writeText(code.textContent || '')
          .then(() => {
            // 显示复制成功提示
            target.textContent = '已复制!'
            target.classList.add('copied')
            setTimeout(() => {
              target.textContent = '复制'
              target.classList.remove('copied')
            }, 2000)
          })
          .catch(err => {
            console.error('复制失败:', err)
          })
        
        return true
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    if (currentNote.value) {
      currentNote.value.content = editor.getHTML()
      handleContentChange()
    }
  },
})

// 编辑器菜单项
const menuItems = [
  {
    icon: 'format_bold',
    action: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive('bold'),
  },
  {
    icon: 'format_italic',
    action: () => editor.value?.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive('italic'),
  },
  {
    icon: 'format_list_bulleted',
    action: () => editor.value?.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive('bulletList'),
  },
  {
    icon: 'format_list_numbered',
    action: () => editor.value?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive('orderedList'),
  },
  {
    icon: 'title',
    action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 1 }),
  },
  {
    icon: 'code',
    action: () => {
      const languages = [
        { value: 'plaintext', label: '纯文本' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'bash', label: 'Bash' },
        { value: 'sql', label: 'SQL' },
        { value: 'json', label: 'JSON' },
        { value: 'xml', label: 'XML/HTML' },
        { value: 'yaml', label: 'YAML' },
        { value: 'markdown', label: 'Markdown' },
      ]
      const language = window.prompt(
        `输入代码语言，支持：\n${languages.map(lang => `${lang.label} (${lang.value})`).join('\n')}`,
        'plaintext'
      )
      if (language) {
        editor.value?.chain()
          .focus()
          .toggleCodeBlock({ language: language.toLowerCase() })
          .run()
      }
    },
    isActive: () => editor.value?.isActive('codeBlock'),
  },
  {
    icon: 'link',
    action: () => {
      const url = window.prompt('输入链接URL')
      if (url) {
        editor.value?.chain().focus().setLink({ href: url }).run()
      }
    },
    isActive: () => editor.value?.isActive('link'),
  },
  {
    icon: 'format_quote',
    action: () => editor.value?.chain().focus().toggleBlockquote().run(),
    isActive: () => editor.value?.isActive('blockquote'),
  },
  {
    icon: 'table_chart',
    action: () => editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    isActive: () => editor.value?.isActive('table'),
  },
  {
    icon: 'check_box',
    action: () => editor.value?.chain().focus().toggleTaskList().run(),
    isActive: () => editor.value?.isActive('taskList'),
  },
  {
    icon: 'horizontal_rule',
    action: () => editor.value?.chain().focus().setHorizontalRule().run(),
  },
]

// 监听笔记变化，更新编辑器内容
watch(currentNote, (newNote) => {
  if (newNote && editor.value) {
    editor.value.commands.setContent(newNote.content || '')
  }
})

// 自动保存防抖
const handleContentChange = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = window.setTimeout(() => {
    handleSaveNote()
  }, 1000)
}

// 保存笔记
const handleSaveNote = async () => {
  if (!currentNote.value) return
  try {
    const response = await fetch(`/api/v1/notes/${currentNote.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: currentNote.value.title,
        content: currentNote.value.content
      })
    })
    if (!response.ok) {
      alert('保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败')
  }
}

// 处理笔记选择
const handleSelectNote = (note: Note | null) => {
  console.log('选中笔记:', note)
  currentNote.value = note
}

// 处理新建笔记
const handleCreateNote = async () => {
  const currentFolder = folderTreeRef.value?.getCurrentFolder()
  if (!currentFolder) {
    alert('请先选择一个目录')
    return
  }

  try {
    const defaultTitle = '新建笔记'
    const filePath = `${currentFolder.path}/${defaultTitle}.md`

    const response = await fetch('/api/v1/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: defaultTitle,
        content: '',
        category_id: currentFolder.id,
        file_path: filePath,
        tag_ids: []
      })
    })

    if (!response.ok) {
      throw new Error('创建笔记失败')
    }

    const newNote = await response.json()
    currentNote.value = newNote

    // 刷新目录树
    await folderTreeRef.value?.handleFolderClick(currentFolder)
  } catch (error) {
    console.error('创建笔记失败:', error)
    alert('创建笔记失败')
  }
}

// 组件销毁时清理编辑器
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
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

/* 代码块样式 */
.ProseMirror pre {
  background: #f5f5f5;
  border-radius: 0.5em;
  padding: 2.5em 1em 1em;
  margin: 0.5em 0;
  overflow-x: auto;
  position: relative;
}

/* 代码块顶部栏 */
.ProseMirror pre::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2em;
  background: #e5e7eb;
  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;
  border-bottom: 1px solid #d1d5db;
  z-index: 1;
}

/* 代码块语言标签 */
.ProseMirror pre::after {
  content: attr(data-language);
  position: absolute;
  top: 0;
  right: 4em;
  padding: 0.25em 0.5em;
  font-size: 0.75em;
  color: #666;
  font-family: ui-monospace, monospace;
  z-index: 2;
  line-height: 1.8;
  text-transform: uppercase;
}

/* 复制按钮 */
.ProseMirror pre button {
  position: absolute;
  top: 0;
  right: 0;
  width: 3.5em;
  height: 2em;
  line-height: 2em;
  text-align: center;
  font-size: 0.75em;
  color: #666;
  background: transparent;
  border: none;
  border-left: 1px solid #d1d5db;
  cursor: pointer;
  z-index: 3;
  transition: all 0.2s;
}

.ProseMirror pre button:hover {
  color: #000;
  background: #d1d5db;
}

.ProseMirror pre button.copied {
  background: #10b981;
  color: white;
}

.ProseMirror pre code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
  line-height: 1.5;
  background: none;
  display: block;
}

/* 语言标签显示 */
.ProseMirror pre[data-language="javascript"]::after { content: 'JavaScript'; }
.ProseMirror pre[data-language="js"]::after { content: 'JavaScript'; }
.ProseMirror pre[data-language="typescript"]::after { content: 'TypeScript'; }
.ProseMirror pre[data-language="ts"]::after { content: 'TypeScript'; }
.ProseMirror pre[data-language="python"]::after { content: 'Python'; }
.ProseMirror pre[data-language="py"]::after { content: 'Python'; }
.ProseMirror pre[data-language="go"]::after { content: 'Go'; }
.ProseMirror pre[data-language="rust"]::after { content: 'Rust'; }
.ProseMirror pre[data-language="java"]::after { content: 'Java'; }
.ProseMirror pre[data-language="cpp"]::after { content: 'C++'; }
.ProseMirror pre[data-language="bash"]::after { content: 'Bash'; }
.ProseMirror pre[data-language="sql"]::after { content: 'SQL'; }
.ProseMirror pre[data-language="json"]::after { content: 'JSON'; }
.ProseMirror pre[data-language="xml"]::after { content: 'XML'; }
.ProseMirror pre[data-language="html"]::after { content: 'HTML'; }
.ProseMirror pre[data-language="yaml"]::after { content: 'YAML'; }
.ProseMirror pre[data-language="markdown"]::after { content: 'Markdown'; }
.ProseMirror pre[data-language="plaintext"]::after { content: '纯文本'; }

/* 行内代码样式 */
.ProseMirror :not(pre) > code {
  background: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 0.3em;
  font-size: 0.9em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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
</style> 