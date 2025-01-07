<template>
  <div class="categories">
    <n-space vertical :size="24">
      <n-card title="分类管理">
        <template #header-extra>
          <n-button type="primary" @click="showCreateModal = true">
            新建分类
          </n-button>
        </template>

        <n-tree
          block-line
          :data="categoriesTree"
          :render-label="renderTreeLabel"
          :expand-on-click="true"
          :default-expanded-keys="expandedKeys"
        />
      </n-card>
    </n-space>

    <!-- 新建/编辑分类对话框 -->
    <n-modal
      v-model:show="showCreateModal"
      preset="card"
      :title="editingCategory ? '编辑分类' : '新建分类'"
      style="width: 500px"
    >
      <n-form
        ref="formRef"
        :model="categoryForm"
        :rules="rules"
      >
        <n-form-item label="名称" path="name">
          <n-input v-model:value="categoryForm.name" placeholder="请输入分类名称" />
        </n-form-item>
        
        <n-form-item label="父分类" path="parentId">
          <n-tree-select
            v-model:value="categoryForm.parentId"
            :options="categoriesTree"
            placeholder="请选择父分类"
            clearable
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import type { TreeOption } from 'naive-ui'
import { Edit, Delete } from '@icon-park/vue-next'

interface Category {
  id: number
  name: string
  parentId: number | null
  children?: Category[]
}

const showCreateModal = ref(false)
const editingCategory = ref<Category | null>(null)
const formRef = ref()
const expandedKeys = ref<number[]>([])

const categoryForm = ref({
  name: '',
  parentId: null as number | null
})

const rules = {
  name: {
    required: true,
    message: '请输入分类名称',
    trigger: 'blur'
  }
}

const categoriesTree = ref<TreeOption[]>([])

const renderTreeLabel = (info: { option: TreeOption }) => {
  const { option } = info
  return h(
    'div',
    {
      style: 'display: flex; align-items: center; justify-content: space-between; width: 100%;'
    },
    [
      h('span', null, option.label),
      h(
        'div',
        {
          style: 'display: flex; gap: 8px;'
        },
        [
          h(
            NButton,
            {
              size: 'tiny',
              onClick: (e: Event) => {
                e.stopPropagation()
                handleEdit(option as unknown as Category)
              }
            },
            { icon: () => h(Edit) }
          ),
          h(
            NButton,
            {
              size: 'tiny',
              onClick: (e: Event) => {
                e.stopPropagation()
                handleDelete(option as unknown as Category)
              }
            },
            { icon: () => h(Delete) }
          )
        ]
      )
    ]
  )
}

const handleSubmit = () => {
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      // TODO: 提交表单
      showCreateModal.value = false
      editingCategory.value = null
      resetForm()
    }
  })
}

const handleEdit = (category: Category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    parentId: category.parentId
  }
  showCreateModal.value = true
}

const handleDelete = (category: Category) => {
  // TODO: 实现删除功能
}

const resetForm = () => {
  categoryForm.value = {
    name: '',
    parentId: null
  }
}

// TODO: 获取分类树数据
</script>

<style scoped lang="scss">
.categories {
  height: 100%;
}
</style> 