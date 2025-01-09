<template>
  <div class="tags-view">
    <n-card title="标签管理">
      <template #header-extra>
        <n-button type="primary" @click="showCreateModal = true">
          新建标签
        </n-button>
      </template>

      <!-- 标签树 -->
      <n-tree
        block-line
        :data="tagsData"
        :render-label="renderLabel"
        :render-prefix="renderPrefix"
        :expand-on-click="true"
        :selectable="false"
      />
    </n-card>

    <!-- 创建标签对话框 -->
    <n-modal v-model:show="showCreateModal" preset="dialog" title="新建标签">
      <n-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="left"
        label-width="80"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="标签名称" path="name">
          <n-input v-model:value="formModel.name" placeholder="请输入标签名称" />
        </n-form-item>
        <n-form-item label="父标签" path="parentId">
          <n-tree-select
            v-model:value="formModel.parentId"
            :options="tagsData"
            placeholder="请选择父标签（可选）"
            clearable
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button type="primary" @click="handleCreate">
          确定
        </n-button>
      </template>
    </n-modal>

    <!-- 编辑标签对话框 -->
    <n-modal v-model:show="showEditModal" preset="dialog" title="编辑标签">
      <n-form
        ref="editFormRef"
        :model="editFormModel"
        :rules="rules"
        label-placement="left"
        label-width="80"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="标签名称" path="name">
          <n-input v-model:value="editFormModel.name" placeholder="请输入标签名称" />
        </n-form-item>
        <n-form-item label="父标签" path="parentId">
          <n-tree-select
            v-model:value="editFormModel.parentId"
            :options="tagsData"
            placeholder="请选择父标签（可选）"
            clearable
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button type="primary" @click="handleEdit">
          确定
        </n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { PricetagsSharp, CreateSharp, TrashSharp } from '@vicons/ionicons5'
import type { FormInst, TreeOption } from 'naive-ui'
import { useMessage } from 'naive-ui'

const message = useMessage()

// 表单相关
const formRef = ref<FormInst | null>(null)
const editFormRef = ref<FormInst | null>(null)
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
const rules = {
  name: {
    required: true,
    message: '请输入标签名称',
    trigger: ['blur', 'input']
  }
}

// 标签数据
const tagsData = ref<TreeOption[]>([])

// 获取标签列表
const fetchTags = async () => {
  try {
    const response = await fetch('/api/v1/tags')
    const data = await response.json()
    tagsData.value = data
  } catch (error) {
    message.error('获取标签列表失败')
  }
}

// 创建标签
const handleCreate = async () => {
  try {
    await formRef.value?.validate()
    const response = await fetch('/api/v1/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formModel.value)
    })
    if (response.ok) {
      message.success('创建成功')
      showCreateModal.value = false
      formModel.value = { name: '', parentId: null }
      await fetchTags()
    } else {
      message.error('创建失败')
    }
  } catch (error) {
    message.error('表单验证失败')
  }
}

// 编辑标签
const handleEdit = async () => {
  try {
    await editFormRef.value?.validate()
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
      message.success('更新成功')
      showEditModal.value = false
      await fetchTags()
    } else {
      message.error('更新失败')
    }
  } catch (error) {
    message.error('表单验证失败')
  }
}

// 删除标签
const handleDelete = async (id: string) => {
  try {
    const response = await fetch(`/api/v1/tags/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      message.success('删除成功')
      await fetchTags()
    } else {
      message.error('删除失败')
    }
  } catch (error) {
    message.error('删除失败')
  }
}

// 渲染标签前缀图标
const renderPrefix = () => {
  return h(NIcon, null, { default: () => h(PricetagsSharp) })
}

// 渲染标签标签（包含编辑和删除按钮）
const renderLabel = (node: TreeOption) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    },
    [
      node.label,
      h(
        NButton,
        {
          text: true,
          type: 'primary',
          size: 'small',
          onClick: (e: Event) => {
            e.stopPropagation()
            editFormModel.value = {
              id: node.key as string,
              name: node.label as string,
              parentId: node.parentId as string | null
            }
            showEditModal.value = true
          }
        },
        { icon: () => h(CreateSharp) }
      ),
      h(
        NButton,
        {
          text: true,
          type: 'error',
          size: 'small',
          onClick: (e: Event) => {
            e.stopPropagation()
            handleDelete(node.key as string)
          }
        },
        { icon: () => h(TrashSharp) }
      )
    ]
  )
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.tags-view {
  max-width: 800px;
  margin: 0 auto;
}
</style> 