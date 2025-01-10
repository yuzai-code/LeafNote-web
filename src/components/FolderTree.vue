<template>
  <div class="flex flex-col h-full">
    <!-- 目录树和笔记列表 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 目录树 -->
      <div class="menu bg-base-100">
        <!-- 新建一级目录按钮 -->
        <div class="navbar bg-base-100">
          <div class="flex-1">
            <span class="text-lg font-bold">笔记目录</span>
          </div>
          <div class="flex-none">
            <button class="btn btn-ghost btn-sm" @click="handleCreateFolder()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新建目录
            </button>
          </div>
        </div>

        <template v-for="folder in folderTree" :key="folder.id">
          <!-- 目录项 -->
          <div>
            <div class="navbar bg-base-100 hover:bg-base-200">
              <div class="flex-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <div v-if="renameTarget?.id === folder.id" class="flex-1">
                  <input 
                    type="text" 
                    v-model="renameValue" 
                    class="input input-bordered input-sm w-full"
                    @keyup.enter="handleRenameConfirm"
                    @keyup.esc="cancelRename"
                    @blur="handleRenameConfirm"
                    :data-rename-id="folder.id"
                  />
                </div>
                <button v-else class="flex-1 text-left text-base" @click="toggleFolder(folder)">
                  {{ folder.name }}
                </button>
              </div>
              <div class="flex-none">
                <div class="dropdown dropdown-end">
                  <button class="btn btn-square btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                    </svg>
                  </button>
                  <ul tabindex="0" class="dropdown-content z-[1] menu menu-sm p-2 shadow bg-base-100 rounded-box w-52">
                    <li><button @click="handleCreateNote(folder)">新建笔记</button></li>
                    <li><button @click="handleCreateFolder(folder)">新建子目录</button></li>
                    <li><button @click="handleRenameFolder(folder)">重命名</button></li>
                    <li><button @click="handleDeleteFolder(folder)" class="text-error">删除</button></li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 子目录和笔记 -->
            <div v-show="isExpanded(folder)">
              <!-- 子目录 -->
              <template v-if="folder.children?.length">
                <div v-for="child in folder.children" :key="child.id" class="pl-4">
                  <div class="navbar bg-base-100 hover:bg-base-200">
                    <div class="flex-1 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <div v-if="renameTarget?.id === child.id" class="flex-1">
                        <input 
                          type="text" 
                          v-model="renameValue" 
                          class="input input-bordered input-sm w-full"
                          @keyup.enter="handleRenameConfirm"
                          @keyup.esc="cancelRename"
                          @blur="handleRenameConfirm"
                          :data-rename-id="child.id"
                        />
                      </div>
                      <button v-else class="flex-1 text-left text-base" @click="toggleFolder(child)">
                        {{ child.name }}
                      </button>
                    </div>
                    <div class="flex-none">
                      <div class="dropdown dropdown-end">
                        <button class="btn btn-square btn-ghost">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                          </svg>
                        </button>
                        <ul tabindex="0" class="dropdown-content z-[1] menu menu-sm p-2 shadow bg-base-100 rounded-box w-52">
                          <li><button @click="handleCreateNote(child)">新建笔记</button></li>
                          <li><button @click="handleCreateFolder(child)">新建子目录</button></li>
                          <li><button @click="handleRenameFolder(child)">重命名</button></li>
                          <li><button @click="handleDeleteFolder(child)" class="text-error">删除</button></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- 子目录的笔记列表 -->
                  <div v-show="isExpanded(child)" v-if="child.notes?.length" class="pl-4">
                    <div v-for="note in child.notes" :key="note.id" 
                      class="navbar bg-base-100 hover:bg-base-200 cursor-pointer"
                      :class="{ 'bg-primary text-primary-content': currentNote?.id === note.id }"
                      @click="handleNoteClick(note)">
                      <div class="flex-1">
                        <div v-if="renameTarget?.id === note.id" class="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <input 
                            type="text" 
                            v-model="renameValue" 
                            class="input input-bordered input-sm w-full max-w-xs"
                            @keyup.enter="handleRenameConfirm"
                            @keyup.esc="cancelRename"
                            @blur="handleRenameConfirm"
                            :data-rename-id="note.id"
                            @click.stop
                          />
                        </div>
                      </div>
                      <div class="flex-none">
                        <div class="dropdown dropdown-end">
                          <button class="btn btn-square btn-ghost" @click.stop>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                            </svg>
                          </button>
                          <ul tabindex="0" class="dropdown-content z-[1] menu menu-sm p-2 shadow bg-base-100 rounded-box w-52">
                            <li><button @click.stop="handleRenameNote(note)">重命名</button></li>
                            <li><button @click.stop="handleMoveNote(note)">移动</button></li>
                            <li><button @click.stop="handleDeleteNote(note)" class="text-error">删除</button></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 笔记列表 -->
              <div v-if="folder.notes?.length" class="pl-4">
                <div v-for="note in folder.notes" :key="note.id" 
                  class="navbar bg-base-100 hover:bg-base-200 cursor-pointer"
                  :class="{ 'bg-primary text-primary-content': currentNote?.id === note.id }"
                  @click="handleNoteClick(note)">
                  <div class="flex-1">
                    <div v-if="renameTarget?.id === note.id" class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <input 
                        type="text" 
                        v-model="renameValue" 
                        class="input input-bordered input-sm w-full max-w-xs"
                        @keyup.enter="handleRenameConfirm"
                        @keyup.esc="cancelRename"
                        @blur="handleRenameConfirm"
                        :data-rename-id="note.id"
                        @click.stop
                      />
                    </div>
                    <span v-else class="text-lg flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {{ note.title }}
                    </span>
                  </div>
                  <div class="flex-none">
                    <div class="dropdown dropdown-end">
                      <button class="btn btn-square btn-ghost" @click.stop>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                        </svg>
                      </button>
                      <ul tabindex="0" class="dropdown-content z-[1] menu menu-sm p-2 shadow bg-base-100 rounded-box w-52">
                        <li><button @click.stop="handleRenameNote(note)">重命名</button></li>
                        <li><button @click.stop="handleMoveNote(note)">移动</button></li>
                        <li><button @click.stop="handleDeleteNote(note)" class="text-error">删除</button></li>
                      </ul>
                    </div>
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
          <li v-for="folder in folderTree" :key="folder.id">
            <button @click="handleMoveConfirm(folder)">{{ folder.name }}</button>
            <ul v-if="folder.children?.length">
              <li v-for="child in folder.children" :key="child.id">
                <button @click="handleMoveConfirm(child)">{{ child.name }}</button>
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
import { ref, onMounted, nextTick } from 'vue'
import type { Note, Category } from '../types'

// 当前编辑的笔记
const currentNote = ref<Note | null>(null)

// 目录树数据
const folderTree = ref<Category[]>([])

// 重命名相关
const showRenameModal = ref(false)
const renameValue = ref('')
const renameTarget = ref<Category | Note | null>(null)

// 移动笔记相关
const showMoveModal = ref(false)
const moveTarget = ref<Note | null>(null)

// 展开的目录ID集合
const expandedFolders = ref<Set<string>>(new Set())

// 判断目录是否展开
const isExpanded = (folder: Category) => {
  return expandedFolders.value.has(folder.id)
}

// 切换目录展开状态
const toggleFolder = async (folder: Category) => {
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
const handleNoteClick = (note: Note) => {
  currentNote.value = note
  emit('select-note', note)
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
      throw new Error(error.message || '创建目录失败')
    }
    
    const newFolder = await response.json()
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
  const title = prompt('请输入笔记标题')
  if (!title) return

  try {
    const response = await fetch('/api/v1/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        content: '',
        category_id: folder.id
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || '创建笔记失败')
    }

    const note = await response.json()
    currentNote.value = note
    emit('select-note', note)
    await fetchFolders()
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
          name: renameValue.value
        })
      })
      if (!response.ok) {
        alert('重命名失败')
      }
    }
    await fetchFolders()
    cancelRename()
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

const handleMoveConfirm = async (targetFolder: Category) => {
  if (!moveTarget.value) return

  try {
    const response = await fetch(`/api/v1/notes/${moveTarget.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category_id: targetFolder.id
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

// 定义事件
const emit = defineEmits<{
  (e: 'select-note', note: Note | null): void
}>()

onMounted(() => {
  console.log('组件已挂载，开始获取目录数据')
  fetchFolders()
})
</script> 