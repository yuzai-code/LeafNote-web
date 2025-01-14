import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { NodeViewProps } from '@tiptap/vue-3'
import type { Component } from 'vue'
import CodeBlockComponent from '../components/CodeBlockComponent.vue'

export interface CodeBlockOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customCode: {
      setCodeBlock: (attributes?: { language: string }) => ReturnType
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType
    }
  }
}

export default Node.create<CodeBlockOptions>({
  name: 'customCode',

  group: 'block',

  code: true,

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: element => element.getAttribute('data-language'),
        renderHTML: attributes => {
          if (!attributes.language) {
            return {}
          }

          return {
            'data-language': attributes.language,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), ['code', 0]]
  },

  addNodeView() {
    return VueNodeViewRenderer(CodeBlockComponent as Component<NodeViewProps>)
  },

  addCommands() {
    return {
      setCodeBlock:
        attributes =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes)
        },
      toggleCodeBlock:
        attributes =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes)
        },
    }
  },
}) 