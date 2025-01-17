import { core } from '@tauri-apps/api';
// 定义接口返回类型
export interface Note {
  id: string
  title: string
  content: string
  yaml_meta: string
  file_path: string
  category_id: string
  created_at: string
  updated_at: string
  version: number
  checksum: string
  category?: Category
  tags?: Tag[]
}

export interface Category {
  id: string
  name: string
  parent_id: string | null
  path: string
  children?: Category[]
}

export interface Tag {
  id: string
  name: string
  parent_id: string | null
  children?: Tag[]
}

// API 服务类
export class ApiService {
  // 获取目录列表
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await core.invoke<Category[]>('get_categories')
      return response
    } catch (error) {
      console.error('获取目录列表失败:', error)
      throw error
    }
  }

  // 获取笔记列表
  static async getNotes(): Promise<Note[]> {
    try {
      const response = await core.invoke<Note[]>('get_notes')
      return response
    } catch (error) {
      console.error('获取笔记列表失败:', error)
      throw error
    }
  }
} 