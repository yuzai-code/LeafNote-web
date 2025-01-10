<template>
  <div class="flex flex-col h-full">
    <!-- 目录树和笔记列表 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 目录树 -->
      <div class="menu bg-base-100 relative">
        <!-- 新建一级目录按钮 -->
        <div class="flex items-center justify-between p-2">
          <span class="text-lg font-bold">笔记目录</span>
          <button class="btn btn-ghost btn-sm" @click="handleCreateFolder()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新建目录
          </button>
        </div>

        <template v-for="folder in folderTree" :key="folder.id">
          <FolderItem
            :folder="folder"
            :is-expanded="isExpanded(folder)"
            :is-renaming="renameTarget?.id === folder.id"
            @toggle="toggleFolder"
            @create-note="handleCreateNote(folder)"
            @create-folder="handleCreateFolder(folder)"
            @rename="handleRenameFolder(folder)"
            @move="handleMoveFolder($event, folder)"
            @delete="handleDeleteFolder(folder)"
            @rename-confirm="handleRenameConfirm"
            @cancel-rename="cancelRename"
            @drop-note="(noteId) => handleDropNote(noteId, folder)"
            @drop-folder="(folderId) => handleDropFolder(folderId, folder)"
          >
            <!-- 子目录和笔记 -->
            <template v-if="folder.children?.length">
              <FolderItem
                v-for="child in folder.children"
                :key="child.id"
                :folder="child"
                :is-expanded="isExpanded(child)"
                :is-renaming="renameTarget?.id === child.id"
                @toggle="toggleFolder"
                @create-note="handleCreateNote(child)"
                @create-folder="handleCreateFolder(child)"
                @rename="handleRenameFolder(child)"
                @move="handleMoveFolder($event, folder)"
                @delete="handleDeleteFolder(child)"
                @rename-confirm="handleRenameConfirm"
                @cancel-rename="cancelRename"
                @drop-note="(noteId) => handleDropNote(noteId, child)"
                @drop-folder="(folderId) => handleDropFolder(folderId, child)"
              >
                <!-- 子目录的笔记列表 -->
                <div v-if="child.notes?.length">
                  <NoteItem
                    v-for="note in child.notes"
                    :key="note.id"
                    :note="note"
                    :is-active="currentNote?.id === note.id"
                    :is-renaming="renameTarget?.id === note.id"
                    @click="handleNoteClick(note)"
                    @rename="handleRenameNote(note)"
                    @move="handleMoveNote(note, child)"
                    @delete="handleDeleteNote(note)"
                    @rename-confirm="handleRenameConfirm"
                    @cancel-rename="cancelRename"
                  />
                </div>
              </FolderItem>
            </template>

            <!-- 笔记列表 -->
            <div v-if="folder.notes?.length">
              <NoteItem
                v-for="note in folder.notes"
                :key="note.id"
                :note="note"
                :is-active="currentNote?.id === note.id"
                :is-renaming="renameTarget?.id === note.id"
                @click="handleNoteClick(note)"
                @rename="handleRenameNote(note)"
                @move="handleMoveNote(note, folder)"
                @delete="handleDeleteNote(note)"
                @rename-confirm="handleRenameConfirm"
                @cancel-rename="cancelRename"
              />
            </div>
          </FolderItem>
        </template>
      </div>
    </div>

    <!-- 移动对话框 -->
    <FolderSelect
      v-model="showMoveModal"
      :folders="folderTree"
      :current-folder="moveSourceFolder"
      @select="handleMoveConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import type { Note, Category } from '../types'
import NoteItem from './NoteItem.vue'
import FolderItem from './FolderItem.vue'
import FolderSelect from './FolderSelect.vue'

// 定义事件
const emit = defineEmits<{
  (e: 'select-note', note: Note | null): void
  (e: 'note-renamed', note: Note): void
}>()

// 当前编辑的笔记
const currentNote = ref<Note | null>(null)

// 目录树数据
const folderTree = ref<Category[]>([])

// 重命名相关
const renameValue = ref('')
const renameTarget = ref<Category | Note | null>(null)

// 移动笔记相关
const showMoveModal = ref(false)
const moveTarget = ref<{ type: 'note' | 'folder', item: Note | Category } | null>(null)
const moveSourceFolder = ref<Category | undefined>(undefined)

// 展开的目录ID集合
const expandedFolders = ref<Set<string>>(new Set())

// 当前选中的目录
const currentFolder = ref<Category | null>(null)

// 获取当前目录
const getCurrentFolder = () => {
  return currentFolder.value
}

// 判断目录是否展开
const isExpanded = (folder: Category) => {
  return expandedFolders.value.has(folder.id)
}

// 切换目录展开状态
const toggleFolder = async (folder: Category) => {
  currentFolder.value = folder
  if (expandedFolders.value.has(folder.id)) {
    expandedFolders.value.delete(folder.id)
  } else {
    expandedFolders.value.add(folder.id)
    // 加载笔记列表
    await handleFolderClick(folder)
  }
}

// 处理目录点击
const handleFolderClick = async (folder: Category) => {
  console.log('点击目录:', folder)
  try {
    const response = await fetch(`/api/v1/notes?category_id=${folder.id}`)
    if (!response.ok) {
      throw new Error('获取笔记列表失败')
    }
    const data = await response.json()
    console.log('获取到的笔记:', data)
    
    // 更新目录树中的笔记列表
    const updateFolderNotes = (folders: Category[]) => {
      for (const f of folders) {
        if (f.id === folder.id) {
          f.notes = data
          break
        }
        if (f.children) {
          updateFolderNotes(f.children)
        }
      }
    }
    updateFolderNotes(folderTree.value)
  } catch (error) {
    console.error('获取笔记列表失败:', error)
    alert('获取笔记列表失败')
  }
}

// 处理笔记点击
const handleNoteClick = async (note: Note) => {
  try {
    const response = await fetch(`/api/v1/notes/${note.id}`)
    if (!response.ok) {
      throw new Error('获取笔记内容失败')
    }
    const data = await response.json()
    console.log('获取到的笔记内容:', data)
    
    // 更新当前笔记
    currentNote.value = data

    // 更新目录树中的笔记标题
    const findAndUpdateNote = (folders: Category[]) => {
      for (const folder of folders) {
        if (folder.notes) {
          const noteIndex = folder.notes.findIndex(n => n.id === data.id)
          if (noteIndex !== -1) {
            folder.notes[noteIndex] = data
            break
          }
        }
        if (folder.children) {
          findAndUpdateNote(folder.children)
        }
      }
    }
    findAndUpdateNote(folderTree.value)
    
    // 触发选中笔记事件
    emit('select-note', data)
  } catch (error) {
    console.error('获取笔记内容失败:', error)
    alert('获取笔记内容失败')
    emit('select-note', null)
  }
}

// 获取下一个可用的目录名
const getNextFolderName = (currentFolder?: Category): string => {
  const usedNames = new Set<string>()
  
  // 收集当前目录下已使用的名称
  if (currentFolder) {
    for (const item of currentFolder.children || []) {
      usedNames.add(item.name)
    }
  } else {
    for (const item of folderTree.value) {
      usedNames.add(item.name)
    }
  }
  
  // 查找可用的名称
  if (!usedNames.has('未命名')) return '未命名'
  let i = 1
  while (usedNames.has(`未命名${i}`)) {
    i++
  }
  return `未命名${i}`
}

// 获取下一个可用的笔记名称
const getNextNoteName = (folder: Category): string => {
  const usedNames = new Set<string>()
  
  // 收集当前目录下已使用的笔记名称
  for (const note of folder.notes || []) {
    usedNames.add(note.title)
  }
  
  // 查找可用的名称
  if (!usedNames.has('新建笔记')) return '新建笔记'
  let i = 1
  while (usedNames.has(`新建笔记${i}`)) {
    i++
  }
  return `新建笔记${i}`
}


// 创建目录
const handleCreateFolder = async (parentFolder?: Category) => {
  console.log('创建目录, 父目录:', parentFolder)
  const defaultName = getNextFolderName(parentFolder)

  try {
    const response = await fetch('/api/v1/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: defaultName,
        parent_id: parentFolder?.id
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '创建目录失败')
    }
    
    const newFolder = await response.json()
    // 保存父目录信息
    newFolder.parent_id = parentFolder?.id
    await fetchFolders()
    
    // 自动展开父目录
    if (parentFolder) {
      expandedFolders.value.add(parentFolder.id)
    }
    
    // 直接进入重命名状态
    renameTarget.value = newFolder
    renameValue.value = defaultName
    nextTick(() => {
      const input = document.querySelector(`input[data-rename-id="${newFolder.id}"]`) as HTMLInputElement
      input?.focus()
      input?.select()
    })
  } catch (error) {
    console.error('创建目录失败:', error)
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        alert('目录名称已存在，请尝试其他名称')
      } else {
        alert(error.message)
      }
    } else {
      alert('创建目录失败')
    }
  }
}

// 创建笔记
const handleCreateNote = async (folder: Category) => {
  console.log('创建笔记, 所在目录:', folder)
  const defaultTitle = getNextNoteName(folder)

  try {
    const response = await fetch('/api/v1/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: defaultTitle,
        content: '',
        category_id: folder.id,
        file_path: `${folder.path}/${defaultTitle}.md`
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '创建笔记失败')
    }

    const note = await response.json()
    currentNote.value = note
    emit('select-note', note)
    
    // 刷新当前目录的笔记列表
    await handleFolderClick(folder)
    
    // 直接进入重命名状态
    renameTarget.value = note
    renameValue.value = defaultTitle
    nextTick(() => {
      const input = document.querySelector(`input[data-rename-id="${note.id}"]`) as HTMLInputElement
      input?.focus()
      input?.select()
    })
  } catch (error) {
    console.error('创建笔记失败:', error)
    alert(error instanceof Error ? error.message : '创建笔记失败')
  }
}

// 取消重命名
const cancelRename = () => {
  renameTarget.value = null
  renameValue.value = ''
}

// 重命名目录或笔记
const handleRenameFolder = (folder: Category) => {
  renameTarget.value = folder
  renameValue.value = folder.name
  nextTick(() => {
    const input = document.querySelector(`input[data-rename-id="${folder.id}"]`) as HTMLInputElement
    input?.focus()
    input?.select()
  })
}

const handleRenameConfirm = async () => {
  if (!renameTarget.value || !renameValue.value.trim()) {
    cancelRename()
    return
  }

  try {
    if ('title' in renameTarget.value) {
      // 重命名笔记
      const response = await fetch(`/api/v1/notes/${renameTarget.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: renameValue.value
        })
      })
      if (response.ok) {
        if (currentNote.value?.id === renameTarget.value.id) {
          currentNote.value.title = renameValue.value
        }
      } else {
        alert('重命名失败')
      }
    } else {
      // 重命名目录
      const response = await fetch(`/api/v1/categories/${renameTarget.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: renameValue.value,
          parent_id: renameTarget.value.parent_id // 保留父目录ID
        })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '重命名失败')
      }
    }
    await fetchFolders()
    cancelRename()
  } catch (error) {
    console.error('重命名失败:', error)
    alert(error instanceof Error ? error.message : '重命名失败')
  }
}

// 移动笔记
const handleMoveNote = (note: Note, sourceFolder: Category) => {
  moveTarget.value = { type: 'note', item: note }
  moveSourceFolder.value = sourceFolder
  showMoveModal.value = true
}

const handleMoveFolder = (folder: Category, sourceFolder: Category) => {
  moveTarget.value = { type: 'folder', item: folder }
  moveSourceFolder.value = sourceFolder
  showMoveModal.value = true
}

const handleMoveConfirm = async (targetFolder: Category) => {
  if (!moveTarget.value) return

  try {
    if (moveTarget.value.type === 'note') {
      const note = moveTarget.value.item as Note
      const response = await fetch(`/api/v1/notes/${note.id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category_id: targetFolder.id
        })
      })

      if (!response.ok) {
        throw new Error('移动笔记失败')
      }
    } else {
      const folder = moveTarget.value.item as Category
      const response = await fetch(`/api/v1/categories/${folder.id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parent_id: targetFolder.id
        })
      })

      if (!response.ok) {
        throw new Error('移动目录失败')
      }
    }

    // 刷新目录树
    await fetchFolders()
    // 重置状态
    moveTarget.value = null
    moveSourceFolder.value = undefined
    showMoveModal.value = false
  } catch (error) {
    console.error('移动失败:', error)
    alert('移动失败')
  }
}

// 根据笔记 ID 查找所在的目录
const findFolderByNoteId = (folders: Category[], noteId: string): Category | null => {
  for (const folder of folders) {
    if (folder.notes?.some(note => note.id === noteId)) {
      return folder
    }
    if (folder.children) {
      const found = findFolderByNoteId(folder.children, noteId)
      if (found) return found
    }
  }
  return null
}

// 删除目录
const handleDeleteFolder = async (folder: Category) => {
  if (!confirm(`确定要删除目录"${folder.name}"吗？目录下的所有笔记也会被删除。`)) return

  try {
    const response = await fetch(`/api/v1/categories/${folder.id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      await fetchFolders()
      
      // 从 folderTree 中移除已删除的目录
      const removeFolder = (folders: Category[]) => {
        for (let i = 0; i < folders.length; i++) {
          const f = folders[i]
          if (f.id === folder.id) {
            folders.splice(i, 1)
            break
          }
          if (f.children) {
            removeFolder(f.children)
          }
        }
      }
      removeFolder(folderTree.value)
    } else {
      const data = await response.json()
      alert(data.error || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败')
  }
}

// 删除笔记
const handleDeleteNote = async (note: Note) => {
  if (!confirm(`确定要删除笔记"${note.title}"吗？`)) return

  try {
    const response = await fetch(`/api/v1/notes/${note.id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      if (currentNote.value?.id === note.id) {
        currentNote.value = null
        emit('select-note', null)
      }
      await fetchFolders()
    } else {
      alert('删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败')
  }
}

// 获取目录树
const fetchFolders = async () => {
  try {
    const response = await fetch('/api/v1/categories')
    if (!response.ok) {
      throw new Error('获取目录列表失败')
    }
    const data = await response.json()
    console.log('目录数据:', data)
    folderTree.value = data
  } catch (error) {
    console.error('获取目录列表失败:', error)
    alert('获取目录列表失败')
  }
}

// 重命名笔记
const handleRenameNote = (note: Note) => {
  renameTarget.value = note
  renameValue.value = note.title
  nextTick(() => {
    const input = document.querySelector(`input[data-rename-id="${note.id}"]`) as HTMLInputElement
    input?.focus()
    input?.select()
  })
}




// 添加 positionDropdown 函数
const activeDropdown = ref<string | null>(null)

// 添加关闭下拉菜单的函数
const closeDropdown = () => {
  activeDropdown.value = null
}

// 添加拖拽处理函数
const handleDropNote = async (noteId: string, targetFolder: Category) => {
  try {
    const response = await fetch(`/api/v1/notes/${noteId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category_id: targetFolder.id
      })
    })

    if (!response.ok) {
      throw new Error('移动笔记失败')
    }

    // 刷新目录树
    await fetchFolders()
  } catch (error) {
    console.error('移动笔记失败:', error)
    alert('移动笔记失败')
  }
}

const handleDropFolder = async (folderId: string, targetFolder: Category) => {
  try {
    const response = await fetch(`/api/v1/categories/${folderId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent_id: targetFolder.id
      })
    })

    if (!response.ok) {
      throw new Error('移动目录失败')
    }

    // 刷新目录树
    await fetchFolders()
  } catch (error) {
    console.error('移动目录失败:', error)
    alert('移动目录失败')
  }
}


onMounted(() => {
  console.log('组件已挂载，开始获取目录数据')
  fetchFolders()
  
  // 添加全局点击事件来关闭下拉菜单
  document.addEventListener('click', closeDropdown)
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

// 暴露方法给父组件
defineExpose({
  getCurrentFolder,
  handleCreateNote,
  handleFolderClick
})
</script>

<style scoped>
.menu {
  position: static !important;
}

.dropdown {
  position: relative !important;
}

.dropdown-content {
  position: fixed !important;
  z-index: 9999 !important;
  opacity: 1;
  visibility: visible;
  transform-origin: top right;
  animation: dropdown-show 0.1s ease-out;
}

@keyframes dropdown-show {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.folder-tree {
  padding: 4px;
  user-select: none;
}

.folder-item {
  padding: 1px 0;
}

.folder-content {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
}

.folder-content:hover {
  background-color: #f5f5f5;
}

.folder-content.active {
  background-color: #e6f7ff;
}

.folder-name {
  margin-left: 4px;
  flex: 1;
}

.folder-actions {
  display: none;
  gap: 4px;
}

.folder-content:hover .folder-actions {
  display: flex;
}

.folder-children {
  padding-left: 12px;
}

.note-list {
  padding-left: 12px;
}

.note-item {
  padding: 1px 0;
}

.note-content {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
}

.note-content:hover {
  background-color: #f5f5f5;
}

.note-content.active {
  background-color: #e6f7ff;
}

.note-title {
  margin-left: 4px;
  flex: 1;
}

.note-actions {
  display: none;
  gap: 4px;
}

.note-content:hover .note-actions {
  display: flex;
}

.rename-input {
  width: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 2px 4px;
  outline: none;
}

.rename-input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: visible !important;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}
</style> 