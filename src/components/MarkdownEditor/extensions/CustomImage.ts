import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageComponent from '../components/ImageComponent.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType
    }
  }
}

export default Node.create({
  name: 'customImage',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageComponent)
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
}) 