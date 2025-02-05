export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  children?: Category[];
  notes?: Note[];
}

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