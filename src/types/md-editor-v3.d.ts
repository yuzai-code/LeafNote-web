declare module 'md-editor-v3' {
  import { Component } from 'vue'
  
  export const MdEditor: Component
  export const MdPreview: Component
  
  export interface ToolbarItem {
    title: string
    icon: string
    action: string
  }
  
  export interface EditorProps {
    modelValue: string
    theme?: string
    language?: string
    toolbars?: string[]
    previewTheme?: string
    style?: string | object
  }
} 