import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { NodeViewProps } from '@tiptap/vue-3'
import type { Component } from 'vue'
import ImageComponent from '../components/ImageComponent.vue'

/**
 * 扩展 Tiptap 的命令类型定义
 * 添加自定义图片相关的命令
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      /**
       * 设置图片节点的命令
       * @param options 图片属性选项
       * @param options.src 图片源地址
       * @param options.alt 图片替代文本
       * @param options.title 图片标题
       */
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType
    }
  }
}

/**
 * 自定义图片节点扩展
 * 支持图片的插入、编辑和渲染
 */
export default Node.create({
  // 节点名称，用于在编辑器中标识这个节点类型
  name: 'customImage',

  // 节点分组，block 表示这是一个块级节点
  group: 'block',

  // atom: true 表示这是一个原子节点，不可分割
  atom: true,

  /**
   * 定义节点的属性
   * 这些属性会被保存在节点的数据中
   */
  addAttributes() {
    return {
      // 图片源地址
      src: {
        default: null,
      },
      // 图片替代文本
      alt: {
        default: null,
      },
      // 图片标题
      title: {
        default: null,
      },
    }
  },

  /**
   * 定义如何从 HTML 解析这个节点
   * 当编辑器从 HTML 内容初始化时使用
   */
  parseHTML() {
    return [
      {
        tag: 'img[src]', // 匹配带有 src 属性的 img 标签
      },
    ]
  },

  /**
   * 定义如何将节点渲染为 HTML
   * @param HTMLAttributes 节点的 HTML 属性
   */
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },

  /**
   * 添加节点视图
   * 使用 Vue 组件来渲染节点的自定义界面
   */
  addNodeView() {
    return VueNodeViewRenderer(ImageComponent as Component<NodeViewProps>)
  },

  /**
   * 添加编辑器命令
   * 这些命令可以通过编辑器实例调用
   */
  addCommands() {
    return {
      /**
       * 设置图片命令
       * @param options 图片属性选项
       * @returns 插入图片节点的命令函数
       */
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