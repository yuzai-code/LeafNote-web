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
  static async fetchApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getCategories(): Promise<Category[]> {
    return this.fetchApi<Category[]>('/categories');
  }

  static async getNotes(): Promise<Note[]> {
    return this.fetchApi<Note[]>('/notes');
  }
}

// Tauri 端 API 实现
class TauriApi {
  static async getCategories(): Promise<Category[]> {
    try {
      return await invoke<Category[]>('get_categories');
    } catch (error) {
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
} 