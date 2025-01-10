export interface Note {
  id: string
  title: string
  content: string
  created_at: string
  category?: {
    id: string
    name: string
  }
  category_id: string | null
  tags: Array<{
    id: string
    name: string
  }>
  tag_ids: string[]
  file_path: string
  yaml_meta: string
}

export interface Category {
  id: string
  name: string
  parent_id: string | null
  path: string
  children?: Category[]
  notes?: Note[]
}

export interface Tag {
  id: string
  name: string
  parent_id: string | null
}

export interface CreateNoteInput extends Omit<Note, 'id' | 'category' | 'tags'> {
  category_id: string | null
  tag_ids: string[]
}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {} 