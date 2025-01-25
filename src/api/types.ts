// 目录接口定义
export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  children?: CategoryWithState[];
  notes?: Note[];
  expanded?: boolean;
  isEditing?: boolean;
  editingName?: string;
}

// 扩展目录接口，用于组件内部状态
export interface CategoryWithState extends Category {
  expanded: boolean;
  isEditing?: boolean;
  editingName?: string;
}

// 笔记接口定义
export interface Note {
  id: string;
  title: string;
  content: string;
  yaml_meta: string;
  file_path: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  version: number;
  checksum: string;
} 

// 标签接口定义
export interface Tag {
  id: string;
  name: string;
  parent_id: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  parent?: Tag | null;
  children?: Tag[];
}