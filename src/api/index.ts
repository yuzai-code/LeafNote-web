import { invoke } from '@tauri-apps/api/core';

// 检查是否在 Tauri 环境中运行
const isTauri = 'window' in globalThis && '__TAURI__' in window;

// API 基础配置
const API_BASE_URL = 'http://127.0.0.1:8080/api/v1';

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
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  parent?: Category | null
  children?: Category[]
  notes?: Note[]
  expanded?: boolean
  isEditing?: boolean
  editingName?: string
}

export interface Tag {
  id: string
  name: string
  parent_id: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  parent?: Tag | null
  children?: Tag[]
}

// Web 端 API 实现
class WebApi {
  static async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      // 抛出后端返回的错误信息
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data.data || data;
  }
  // 获取目录列表
  static async getCategories(): Promise<Category[]> {
    return this.fetchApi<Category[]>('/categories');
  }
  
  // 新建目录
  static async createCategory(category: Partial<Category>): Promise<Category> {
    return this.fetchApi<Category>('/categories', { 
      method: 'POST', 
      body: JSON.stringify(category) 
    });
  }

  // 获取笔记列表
  static async getNotes(): Promise<Note[]> {
    return this.fetchApi<Note[]>('/notes');
  }

  // 笔记相关接口
  static async createNote(note: Partial<Note>): Promise<Note> {
    return this.fetchApi<Note>('/notes', { 
      method: 'POST', 
      body: JSON.stringify(note) 
    });
  }

  static async getNoteById(id: string): Promise<Note> {
    return this.fetchApi<Note>(`/notes/${id}`);
  }

  static async updateNote(id: string, note: Partial<Note>): Promise<Note> {
    return this.fetchApi<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(note)
    });
  }

  static async deleteNote(id: string): Promise<void> {
    return this.fetchApi<void>(`/notes/${id}`, { method: 'DELETE' });
  }

  // 标签相关接口
  static async getTags(): Promise<Tag[]> {
    return this.fetchApi<Tag[]>('/tags');
  }

  static async createTag(tag: Partial<Tag>): Promise<Tag> {
    return this.fetchApi<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(tag)
    });
  }

  static async getTagById(id: string): Promise<Tag> {
    return this.fetchApi<Tag>(`/tags/${id}`);
  }

  static async updateTag(id: string, tag: Partial<Tag>): Promise<Tag> {
    return this.fetchApi<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tag)
    });
  }

  static async deleteTag(id: string): Promise<void> {
    return this.fetchApi<void>(`/tags/${id}`, { method: 'DELETE' });
  }

  // 目录相关接口
  static async getCategoryById(id: string): Promise<Category> {
    return this.fetchApi<Category>(`/categories/${id}`);
  }

  static async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    return this.fetchApi<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category)
    });
  }

  static async deleteCategory(id: string): Promise<void> {
    return this.fetchApi<void>(`/categories/${id}`, { method: 'DELETE' });
  }
}

// Tauri 端 API 实现
class TauriApi {
  // 静态方法，异步获取目录列表
  static async getCategories(): Promise<Category[]> {
    try {
      // 调用invoke方法，获取目录列表
      return await invoke<Category[]>('get_categories');
    } catch (error) {
      // 如果获取目录列表失败，打印错误信息，并抛出错误
      console.error('获取目录列表失败:', error);
      throw error;
    }
  }

  static async getNotes(): Promise<Note[]> {
    try {
      return await invoke<Note[]>('get_notes');
    } catch (error) {
      console.error('获取笔记列表失败:', error);
      throw error;
    }
  }

  // 笔记相关接口
  static async createNote(note: Partial<Note>): Promise<Note> {
    return await invoke<Note>('create_note', { note });
  }

  static async getNoteById(id: string): Promise<Note> {
    return await invoke<Note>('get_note_by_id', { id });
  }

  static async updateNote(id: string, note: Partial<Note>): Promise<Note> {
    return await invoke<Note>('update_note', { id, note });
  }

  static async deleteNote(id: string): Promise<void> {
    return await invoke<void>('delete_note', { id });
  }

  // 标签相关接口
  static async getTags(): Promise<Tag[]> {
    return await invoke<Tag[]>('get_tags');
  }

  static async createTag(tag: Partial<Tag>): Promise<Tag> {
    return await invoke<Tag>('create_tag', { tag });
  }

  static async getTagById(id: string): Promise<Tag> {
    return await invoke<Tag>('get_tag_by_id', { id });
  }

  static async updateTag(id: string, tag: Partial<Tag>): Promise<Tag> {
    return await invoke<Tag>('update_tag', { id, tag });
  }

  static async deleteTag(id: string): Promise<void> {
    return await invoke<void>('delete_tag', { id });
  }

  // 目录相关接口
  static async getCategoryById(id: string): Promise<Category> {
    return await invoke<Category>('get_category_by_id', { id });
  }

  static async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    return await invoke<Category>('update_category', { id, category });
  }

  static async deleteCategory(id: string): Promise<void> {
    return await invoke<void>('delete_category', { id });
  }

  // 新建目录
  static async createCategory(category: Partial<Category>): Promise<Category> {
    return await invoke<Category>('create_category', { category });
  }
}

// API 服务类
export class ApiService {
  private static api = isTauri ? TauriApi : WebApi;

  // 获取目录列表
  static async getCategories(): Promise<Category[]> {
    try {
      return await this.api.getCategories();
    } catch (error) {
      console.error('获取目录列表失败:', error);
      throw error;
    }
  }

  // 获取笔记列表
  static async getNotes(): Promise<Note[]> {
    try {
      return await this.api.getNotes();
    } catch (error) {
      console.error('获取笔记列表失败:', error);
      throw error;
    }
  }

  // 笔记相关接口
  static async createNote(note: Partial<Note>): Promise<Note> {
    try {
      return await this.api.createNote(note);
    } catch (error) {
      console.error('创建笔记失败:', error);
      throw error;
    }
  }

  static async getNoteById(id: string): Promise<Note> {
    try {
      return await this.api.getNoteById(id);
    } catch (error) {
      console.error('获取笔记详情失败:', error);
      throw error;
    }
  }

  static async updateNote(id: string, note: Partial<Note>): Promise<Note> {
    try {
      return await this.api.updateNote(id, note);
    } catch (error) {
      console.error('更新笔记失败:', error);
      throw error;
    }
  }

  static async deleteNote(id: string): Promise<void> {
    try {
      return await this.api.deleteNote(id);
    } catch (error) {
      console.error('删除笔记失败:', error);
      throw error;
    }
  }

  // 标签相关接口
  static async getTags(): Promise<Tag[]> {
    try {
      return await this.api.getTags();
    } catch (error) {
      console.error('获取标签列表失败:', error);
      throw error;
    }
  }

  static async createTag(tag: Partial<Tag>): Promise<Tag> {
    try {
      return await this.api.createTag(tag);
    } catch (error) {
      console.error('创建标签失败:', error);
      throw error;
    }
  }

  static async getTagById(id: string): Promise<Tag> {
    try {
      return await this.api.getTagById(id);
    } catch (error) {
      console.error('获取标签详情失败:', error);
      throw error;
    }
  }

  static async updateTag(id: string, tag: Partial<Tag>): Promise<Tag> {
    try {
      return await this.api.updateTag(id, tag);
    } catch (error) {
      console.error('更新标签失败:', error);
      throw error;
    }
  }

  static async deleteTag(id: string): Promise<void> {
    try {
      return await this.api.deleteTag(id);
    } catch (error) {
      console.error('删除标签失败:', error);
      throw error;
    }
  }

  // 目录相关接口
  static async getCategoryById(id: string): Promise<Category> {
    try {
      return await this.api.getCategoryById(id);
    } catch (error) {
      console.error('获取目录详情失败:', error);
      throw error;
    }
  }

  static async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    try {
      return await this.api.updateCategory(id, category);
    } catch (error) {
      console.error('更新目录失败:', error);
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      return await this.api.deleteCategory(id);
    } catch (error) {
      console.error('删除目录失败:', error);
      throw error;
    }
  }

  // 新建目录
  static async createCategory(category: Partial<Category>): Promise<Category> {
    try {
      return await this.api.createCategory(category);
    } catch (error) {
      console.error('创建目录失败:', error);
      throw error;
    }
  }
} 