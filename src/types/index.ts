export interface Note {
  id: string
  title: string
  content: string
  created_at: string
  category_id: string
  tags: Array<{
    id: string
    name: string
  }>
}

export interface Category {
  id: string
  name: string
  path: string
  parent_id: string | null
  children?: Category[]
  notes?: Note[]
} 