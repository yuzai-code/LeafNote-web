<template>
  <div class="markdown-editor">
    <!-- 工具栏 -->
    <Toolbar :editor="editor" />

    <!-- 编辑区域 -->
    <EditorContent :editor="editor" class="editor-content" />

    <!-- 悬浮菜单 -->
    <MenuBubble :editor="editor" v-if="editor" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Blockquote from "@tiptap/extension-blockquote";
import { onBeforeUnmount } from "vue";
import type { Editor as EditorType } from "@tiptap/core";
import Toolbar from "./components/Toolbar.vue";
import MenuBubble from "./components/MenuBubble.vue";
import CustomImage from "./extensions/CustomImage";
import CustomCode from "./extensions/CustomCode";

// 创建一个扩展来处理空列表项的退出
const ExitListOnEnter = Extension.create({
  name: "exitListOnEnter",
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }: { editor: EditorType }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        if (!selection.empty) {
          return false;
        }

        const node = $from.node();
        const parent = $from.parent;

        if (node.type.name === "listItem" && parent.textContent === "") {
          return editor.commands.liftListItem("listItem");
        }

        return false;
      },
    };
  },
});

const props = defineProps<{
  content?: string;
  placeholder?: string;
  autofocus?: boolean;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  "update:content": [content: string];
  save: [content: string];
}>();

// 初始化编辑器
const editor = useEditor({
  content: props.content,
  autofocus: props.autofocus,
  editable: !props.readonly,
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
      blockquote: false,
    }),
    Blockquote.configure({
      HTMLAttributes: {
        class: "border-l-4 border-gray-200 pl-4 my-2",
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder || "开始编写你的笔记...",
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    CustomImage,
    CustomCode,
    ExitListOnEnter,
  ],
  onUpdate: ({ editor }) => {
    emit("update:content", editor.getHTML());
  },
});

// 组件销毁时清理编辑器
onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style lang="scss">
.markdown-editor {
  @apply border rounded-lg overflow-hidden;

  .editor-content {
    @apply p-4 min-h-[300px] prose max-w-none;

    .ProseMirror {
      @apply outline-none;

      > * + * {
        @apply mt-2;
      }

      p {
        @apply my-0 leading-normal;
      }

      ul,
      ol {
        @apply pl-4 my-0;

        li {
          @apply mt-0 mb-0;
        }
      }

      // 任务列表样式
      ul[data-type="taskList"] {
        @apply list-none pl-0;

        li {
          @apply flex gap-2 mt-0;

          > label {
            @apply cursor-pointer;
          }

          > div {
            @apply flex-1;
          }
        }
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        @apply leading-tight mt-4 mb-2;
      }

      code {
        @apply bg-gray-100 text-gray-800 px-1 rounded;
      }

      pre {
        @apply bg-gray-900 text-white p-4 rounded-lg my-2;

        code {
          @apply bg-transparent text-inherit p-0;
        }
      }

      blockquote {
        @apply pl-4 border-l-4 border-gray-200 my-2 not-italic;
        &::before,
        &::after {
          content: none !important;
        }
        quotes: none !important;
      }

      hr {
        @apply border-t-2 border-gray-200 my-4;
      }
    }
  }
}
</style>
