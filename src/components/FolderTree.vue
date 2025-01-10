<template>
  <div class="flex flex-col h-full">
    <!-- 搜索框 -->
    <div class="form-control p-4">
      <div class="input-group">
        <input 
          type="text" 
          v-model="searchText"
          placeholder="搜索笔记..." 
          class="input input-bordered w-full"
        />
        <button class="btn btn-square">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 目录树和笔记列表 -->
    <div class="flex-1 overflow-y-auto">
      <div class="flex justify-between items-center p-4">
        <h3 class="font-bold">笔记目录</h3>
        <div class="dropdown dropdown-end">
          <button tabindex="0" class="btn btn-ghost btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <button @click="($event: MouseEvent) => handleCreateFolder()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                新建目录
              </button>
            </li>
            <li>
              <button @click="($event: MouseEvent) => handleCreateNote()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                新建笔记
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 目录树 -->
      <div class="menu bg-base-100">
        <template v-for="folder in folderTree" :key="folder.key">
          <!-- 目录项 -->
          <div class="collapse collapse-arrow">
            <input type="checkbox" class="peer" :checked="true" /> 
            <div class="collapse-title flex items-center gap-2 min-h-8 !p-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span class="flex-1">{{ folder.label }}</span>
              <div class="dropdown dropdown-end">
                <button tabindex="0" class="btn btn-ghost btn-xs" @click.stop>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <button @click="($event: MouseEvent) => handleCreateFolder(folder)">新建子目录</button>
                  </li>
                  <li>
                    <button @click="($event: MouseEvent) => handleCreateNote(folder)">新建笔记</button>
                  </li>
                  <li>
                    <button @click="($event: MouseEvent) => handleRenameFolder(folder)">重命名</button>
                  </li>
                  <li>
                    <button @click="($event: MouseEvent) => handleDeleteFolder(folder)" class="text-error">删除</button>
                  </li>
                </ul>
              </div>
            </div>
            <div class="collapse-content !p-0">
              <!-- 子目录 -->
              <template v-if="folder.children?.length">
                <div v-for="child in folder.children" :key="child.key" class="pl-4">
                  <div class="collapse collapse-arrow">
                    <input type="checkbox" class="peer" :checked="true" />
                    <div class="collapse-title flex items-center gap-2 min-h-8 !p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span class="flex-1">{{ child.label }}</span>
                      <div class="dropdown dropdown-end">
                        <button tabindex="0" class="btn btn-ghost btn-xs" @click.stop>
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li>
                            <button @click="($event: MouseEvent) => handleCreateFolder(child)">新建子目录</button>
                          </li>
                          <li>
                            <button @click="($event: MouseEvent) => handleCreateNote(child)">新建笔记</button>
                          </li>
                          <li>
                            <button @click="($event: MouseEvent) => handleRenameFolder(child)">重命名</button>
                          </li>
                          <li>
                            <button @click="($event: MouseEvent) => handleDeleteFolder(child)" class="text-error">删除</button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="collapse-content !p-0">
                      <!-- 笔记列表 -->
                      <div v-if="child.notes?.length" class="pl-4">
                        <div v-for="note in child.notes" :key="note.id" 
                          class="flex items-center gap-2 p-2 hover:bg-base-300 cursor-pointer"
                          :class="{ 'bg-primary text-primary-content': currentNote?.id === note.id }"
                          @click="($event: MouseEvent) => handleNoteClick(note)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span class="flex-1 truncate">{{ note.title }}</span>
                          <div class="dropdown dropdown-end">
                            <button tabindex="0" class="btn btn-ghost btn-xs" @click.stop>
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                              <li>
                                <button @click="($event: MouseEvent) => handleRenameNote(note)">重命名</button>
                              </li>
                              <li>
                                <button @click="($event: MouseEvent) => handleMoveNote(note)">移动</button>
                              </li>
                              <li>
                                <button @click="($event: MouseEvent) => handleDeleteNote(note)" class="text-error">删除</button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <!-- 笔记列表 -->
              <div v-if="folder.notes?.length" class="pl-4">
                <div v-for="note in folder.notes" :key="note.id" 
                  class="flex items-center gap-2 p-2 hover:bg-base-300 cursor-pointer"
                  :class="{ 'bg-primary text-primary-content': currentNote?.id === note.id }"
                  @click="($event: MouseEvent) => handleNoteClick(note)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span class="flex-1 truncate">{{ note.title }}</span>
                  <div class="dropdown dropdown-end">
                    <button tabindex="0" class="btn btn-ghost btn-xs" @click.stop>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li>
                        <button @click="($event: MouseEvent) => handleRenameNote(note)">重命名</button>
                      </li>
                      <li>
                        <button @click="($event: MouseEvent) => handleMoveNote(note)">移动</button>
                      </li>
                      <li>
                        <button @click="($event: MouseEvent) => handleDeleteNote(note)" class="text-error">删除</button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 重命名对话框 -->
    <dialog :class="{ 'modal modal-open': showRenameModal }" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">重命名</h3>
        <div class="form-control">
          <input 
            type="text" 
            v-model="renameValue" 
            class="input input-bordered" 
            placeholder="请输入新名称"
            @keyup.enter="handleRenameConfirm"
          />
        </div>
        <div class="modal-action">
          <button class="btn" @click="showRenameModal = false">取消</button>
          <button class="btn btn-primary" @click="handleRenameConfirm">确定</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showRenameModal = false">关闭</button>
      </form>
    </dialog>

    <!-- 移动笔记对话框 -->
    <dialog :class="{ 'modal modal-open': showMoveModal }" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">移动到</h3>
        <ul class="menu bg-base-200 rounded-box">
          <li v-for="folder in folderTree" :key="folder.key">
            <a @click="handleMoveConfirm(folder)">{{ folder.label }}</a>
            <ul v-if="folder.children?.length">
              <li v-for="child in folder.children" :key="child.key">
                <a @click="handleMoveConfirm(child)">{{ child.label }}</a>
              </li>
            </ul>
          </li>
        </ul>
        <div class="modal-action">
          <button class="btn" @click="showMoveModal = false">取消</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showMoveModal = false">关闭</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Note, Folder } from '../types'

// 搜索
const searchText = ref('')

// 当前编辑的笔记
const currentNote = ref<Note | null>(null)

// 目录树数据
const folderTree = ref<Folder[]>([])

// 重命名相关
const showRenameModal = ref(false)
const renameValue = ref('')
const renameTarget = ref<Folder | Note | null>(null)

// 移动笔记相关
const showMoveModal = ref(false)
const moveTarget = ref<Note | null>(null)

// 处理目录点击
const handleFolderClick = (folder: Folder) => {
  // 加载目录下的笔记
  fetchNotes(folder.key)
}

// 处理笔记点击
const handleNoteClick = (note: Note) => {
  currentNote.value = note
  emit('select-note', note)
}

// 创建目录
const handleCreateFolder = async (parentFolder?: Folder) => {
  const name = prompt('请输入目录名称')
  if (!name) return

  try {
    const response = await fetch('/api/v1/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        parent_id: parentFolder?.key || null
      })
    })
    if (response.ok) {
      await fetchFolders()
    } else {
      alert('创建目录失败')
    }
  } catch (error) {
    console.error('创建目录失败:', error)
    alert('创建目录失败')
  }
}

// 创建笔记
const handleCreateNote = async (folder?: Folder) => {
  if (!folder && !confirm('是否在根目录创建笔记？')) return

  const timestamp = new Date().getTime()
  const title = `新建笔记_${timestamp}`
  try {
    const response = await fetch('/api/v1/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        content: '',
        folder_id: folder?.key || null
      })
    })
    if (response.ok) {
      const note = await response.json()
      currentNote.value = note
      emit('select-note', note)
      await fetchFolders()
    } else {
      alert('创建笔记失败')
    }
  } catch (error) {
    console.error('创建笔记失败:', error)
    alert('创建笔记失败')
  }
}

// 重命名目录或笔记
const handleRenameFolder = (folder: Folder) => {
  renameTarget.value = folder
  renameValue.value = folder.label
  showRenameModal.value = true
}

const handleRenameNote = (note: Note) => {
  renameTarget.value = note
  renameValue.value = note.title
  showRenameModal.value = true
}

const handleRenameConfirm = async () => {
  if (!renameTarget.value || !renameValue.value.trim()) return

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
      const response = await fetch(`/api/v1/categories/${renameTarget.value.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: renameValue.value
        })
      })
      if (!response.ok) {
        alert('重命名失败')
      }
    }
    await fetchFolders()
    showRenameModal.value = false
  } catch (error) {
    console.error('重命名失败:', error)
    alert('重命名失败')
  }
}

// 移动笔记
const handleMoveNote = (note: Note) => {
  moveTarget.value = note
  showMoveModal.value = true
}

const handleMoveConfirm = async (targetFolder: Folder) => {
  if (!moveTarget.value) return

  try {
    const response = await fetch(`/api/v1/notes/${moveTarget.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        folder_id: targetFolder.key
      })
    })
    if (response.ok) {
      await fetchFolders()
      showMoveModal.value = false
    } else {
      alert('移动失败')
    }
  } catch (error) {
    console.error('移动失败:', error)
    alert('移动失败')
  }
}

// 删除目录
const handleDeleteFolder = async (folder: Folder) => {
  if (!confirm(`确定要删除目录"${folder.label}"吗？目录下的所有笔记也会被删除。`)) return

  try {
    const response = await fetch(`/api/v1/categories/${folder.key}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      await fetchFolders()
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
    const data = await response.json()
    folderTree.value = data
  } catch (error) {
    console.error('获取目录列表失败:', error)
    alert('获取目录列表失败')
  }
}

// 获取目录下的笔记
const fetchNotes = async (folderId: string) => {
  try {
    const response = await fetch(`/api/v1/notes?folder_id=${folderId}`)
    const data = await response.json()
    // 更新目录树中的笔记列表
    const updateFolderNotes = (folders: Folder[]) => {
      for (const folder of folders) {
        if (folder.key === folderId) {
          folder.notes = data
          break
        }
        if (folder.children) {
          updateFolderNotes(folder.children)
        }
      }
    }
    updateFolderNotes(folderTree.value)
  } catch (error) {
    console.error('获取笔记列表失败:', error)
    alert('获取笔记列表失败')
  }
}

// 定义事件
const emit = defineEmits<{
  (e: 'select-note', note: Note | null): void
}>()

onMounted(() => {
  fetchFolders()
})
</script> 