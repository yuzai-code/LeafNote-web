<template>
  <div class="p-4">
    <div class="card bg-base-100">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">标签管理</h2>
          <button class="btn btn-primary" @click="showCreateModal = true">
            新建标签
          </button>
        </div>

        <!-- 标签树 -->
        <ul class="menu bg-base-200 rounded-box">
          <li v-for="tag in tagsData" :key="tag.key">
            <div class="flex justify-between items-center w-full">
              <a class="flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {{ tag.label }}
              </a>
              <div class="flex gap-2">
                <button class="btn btn-ghost btn-sm" @click="handleEditClick(tag)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button class="btn btn-ghost btn-sm text-error" @click="handleDelete(tag.key)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <ul v-if="tag.children?.length">
              <li v-for="child in tag.children" :key="child.key">
                <div class="flex justify-between items-center w-full">
                  <a class="flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ child.label }}
                  </a>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-sm" @click="handleEditClick(child)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button class="btn btn-ghost btn-sm text-error" @click="handleDelete(child.key)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <!-- 创建标签对话框 -->
    <dialog :class="{ 'modal modal-open': showCreateModal }" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">新建标签</h3>
        <form @submit.prevent="handleCreate">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">标签名称</span>
            </label>
            <input 
              type="text" 
              v-model="formModel.name" 
              placeholder="请输入标签名称" 
              class="input input-bordered w-full"
              :class="{ 'input-error': formErrors.name }"
            />
            <label class="label" v-if="formErrors.name">
              <span class="label-text-alt text-error">{{ formErrors.name }}</span>
            </label>
          </div>
          <div class="form-control w-full mt-4">
            <label class="label">
              <span class="label-text">父标签</span>
            </label>
            <select 
              v-model="formModel.parentId" 
              class="select select-bordered w-full"
            >
              <option value="">无</option>
              <option 
                v-for="tag in tagsData" 
                :key="tag.key" 
                :value="tag.key"
              >
                {{ tag.label }}
              </option>
            </select>
          </div>
          <div class="modal-action">
            <button type="button" class="btn" @click="showCreateModal = false">取消</button>
            <button type="submit" class="btn btn-primary">确定</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showCreateModal = false">关闭</button>
      </form>
    </dialog>

    <!-- 编辑标签对话框 -->
    <dialog :class="{ 'modal modal-open': showEditModal }" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">编辑标签</h3>
        <form @submit.prevent="handleEdit">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">标签名称</span>
            </label>
            <input 
              type="text" 
              v-model="editFormModel.name" 
              placeholder="请输入标签名称" 
              class="input input-bordered w-full"
              :class="{ 'input-error': formErrors.name }"
            />
            <label class="label" v-if="formErrors.name">
              <span class="label-text-alt text-error">{{ formErrors.name }}</span>
            </label>
          </div>
          <div class="form-control w-full mt-4">
            <label class="label">
              <span class="label-text">父标签</span>
            </label>
            <select 
              v-model="editFormModel.parentId" 
              class="select select-bordered w-full"
            >
              <option value="">无</option>
              <option 
                v-for="tag in tagsData" 
                :key="tag.key" 
                :value="tag.key"
              >
                {{ tag.label }}
              </option>
            </select>
          </div>
          <div class="modal-action">
            <button type="button" class="btn" @click="showEditModal = false">取消</button>
            <button type="submit" class="btn btn-primary">确定</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showEditModal = false">关闭</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Tag {
  key: string
  label: string
  parentId: string | null
  children?: Tag[]
}

// 表单相关
const showCreateModal = ref(false)
const showEditModal = ref(false)
const formModel = ref({
  name: '',
  parentId: null as string | null
})
const editFormModel = ref({
  id: '',
  name: '',
  parentId: null as string | null
})
const formErrors = ref({
  name: ''
})

// 标签数据
const tagsData = ref<Tag[]>([])

// 获取标签列表
const fetchTags = async () => {
  try {
    const response = await fetch('/api/v1/tags')
    const data = await response.json()
    tagsData.value = data
  } catch (error) {
    console.error('获取标签列表失败:', error)
    alert('获取标签列表失败')
  }
}

// 验证表单
const validateForm = (form: { name: string }) => {
  const errors = {
    name: ''
  }
  if (!form.name.trim()) {
    errors.name = '请输入标签名称'
  }
  formErrors.value = errors
  return !errors.name
}

// 创建标签
const handleCreate = async () => {
  if (!validateForm(formModel.value)) return

  try {
    const response = await fetch('/api/v1/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formModel.value)
    })
    if (response.ok) {
      alert('创建成功')
      showCreateModal.value = false
      formModel.value = { name: '', parentId: null }
      await fetchTags()
    } else {
      alert('创建失败')
    }
  } catch (error) {
    console.error('创建失败:', error)
    alert('创建失败')
  }
}

// 编辑标签
const handleEditClick = (tag: Tag) => {
  editFormModel.value = {
    id: tag.key,
    name: tag.label,
    parentId: tag.parentId
  }
  showEditModal.value = true
}

const handleEdit = async () => {
  if (!validateForm(editFormModel.value)) return

  try {
    const response = await fetch(`/api/v1/tags/${editFormModel.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editFormModel.value.name,
        parent_id: editFormModel.value.parentId
      })
    })
    if (response.ok) {
      alert('更新成功')
      showEditModal.value = false
      await fetchTags()
    } else {
      alert('更新失败')
    }
  } catch (error) {
    console.error('更新失败:', error)
    alert('更新失败')
  }
}

// 删除标签
const handleDelete = async (id: string) => {
  if (!confirm('确定要删除这个标签吗？')) return

  try {
    const response = await fetch(`/api/v1/tags/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      alert('删除成功')
      await fetchTags()
    } else {
      alert('删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败')
  }
}

onMounted(() => {
  fetchTags()
})
</script> 