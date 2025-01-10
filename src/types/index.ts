export interface Note {
  id: string
  title: string
  content: string
  created_at: string
  folder_id: string
  tags: Array<{
    id: string
    name: string
  }>
}

export interface Folder {
  key: string
  label: string
  parentId: string | null
  children?: Folder[]
  notes?: Note[]
} 