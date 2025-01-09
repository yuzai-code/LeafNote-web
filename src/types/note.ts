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

export interface CreateNoteInput extends Omit<Note, 'id' | 'category' | 'tags'> {
  category_id: string | null
  tag_ids: string[]
} 