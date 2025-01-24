<template>
  <div class="h-full p-4 flex flex-col">
    <!-- 搜索框 -->
    <div class="form-control mb-2">
      <input
        type="text"
        placeholder="搜索文件夹..."
        class="input input-bordered input-sm w-full"
      />
    </div>

    <!-- 操作按钮组 -->
    <div class="flex gap-2 mb-4">
      <button
        class="btn btn-sm btn-outline tooltip tooltip-bottom"
        data-tip="新建笔记"
        @click="() => handleCreateNote(null)"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
      <button
        class="btn btn-sm btn-outline tooltip tooltip-bottom"
        data-tip="新建目录"
        @click="handleCreateFolder"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 13h6m-3-3v6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </button>
      <button
        class="btn btn-sm btn-outline tooltip tooltip-bottom"
        data-tip="排序"
        @click="handleSort"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4h13M3 8h9M3 12h5m8 0l-4-4m4 4l-4 4"
          />
        </svg>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-4">
      <div class="loading loading-spinner loading-md"></div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="alert alert-error mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- 目录树 -->
    <div v-else class="flex-1">
      <template v-for="folder in folders" :key="folder.id">
        <!-- 文件夹项 -->
        <div class="cursor-pointer">
          <div
            class="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg"
            :class="{
              'pl-[calc(12px*var(--depth,1))]': folder.path.split('/').length - 1,
            }"
            :style="{ '--depth': folder.path.split('/').length - 1 }"
          >
            <!-- 展开/折叠图标 -->
            <div class="flex items-center gap-2 flex-1 cursor-pointer" @click="toggleFolder(folder)">
              <svg
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-90': folder.expanded }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <!-- 文件夹图标 -->
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <!-- 目录名称/重命名输入框 -->
              <div class="flex-1">
                <input
                  v-if="folder.isEditing"
                  :ref="el => setInputRef(el, folder.id)"
                  v-model="folder.editingName"
                  class="input input-sm input-bordered w-full"
                  @blur="handleRename(folder)"
                  @keyup.enter="handleRename(folder)"
                  @keyup.esc="cancelRename(folder)"
                  @click.stop
                />
                <span v-else class="text-sm">{{ folder.name }}</span>
              </div>
            </div>
            <FolderItem 
              @create-note="handleCreateNote(folder)"
              @create-folder="handleCreateSubFolder(folder)"
              @rename="startRename(folder)"
              @delete="handleDeleteFolder(folder)"
            />
          </div>
          <!-- 子文件夹 -->
          <div v-if="folder.expanded && folder.children?.length" class="mt-1">
            <template v-for="child in folder.children" :key="child.id">
              <div class="cursor-pointer">
                <div
                  class="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg"
                  :class="{
                    'pl-[calc(12px*var(--depth,1))]': child.path.split('/').length - 1,
                  }"
                  :style="{ '--depth': child.path.split('/').length - 1 }"
                >
                  <!-- 展开/折叠图标 -->
                  <div class="flex items-center gap-2 flex-1 cursor-pointer" @click="toggleFolder(child)">
                    <svg
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-90': child.expanded }"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <!-- 文件夹图标 -->
                    <svg
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <!-- 目录名称/重命名输入框 -->
                    <div class="flex-1">
                      <input
                        v-if="child.isEditing"
                        :ref="el => setInputRef(el, child.id)"
                        v-model="child.editingName"
                        class="input input-sm input-bordered w-full"
                        @blur="handleRename(child)"
                        @keyup.enter="handleRename(child)"
                        @keyup.esc="cancelRename(child)"
                        @click.stop
                      />
                      <span v-else class="text-sm">{{ child.name }}</span>
                    </div>
                  </div>
                  <FolderItem 
                    @create-note="handleCreateNote(child)"
                    @create-folder="handleCreateSubFolder(child)"
                    @rename="startRename(child)"
                    @delete="handleDeleteFolder(child)"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, reactive } from "vue";
import type { ComponentPublicInstance } from 'vue';
import { ApiService, Category, Note } from "../api";
import FolderItem from "./FolderItem.vue";

// 目录列表状态
const folders = ref<(Category & { expanded?: boolean; isEditing?: boolean; editingName?: string })[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const renameInputs = reactive<Record<string, HTMLInputElement | null>>({});

// 设置输入框引用
const setInputRef = (el: ComponentPublicInstance | Element | null, id: string) => {
  if (el instanceof HTMLInputElement) {
    renameInputs[id] = el;
  } else if (el && 'focus' in el && typeof el.focus === 'function') {
    renameInputs[id] = el as unknown as HTMLInputElement;
  } else {
    renameInputs[id] = null;
  }
};

// 处理新建笔记
const handleCreateNote = async (folder: Category | null) => {
  try {
    const newNote: Partial<Note> = {
      title: "新建笔记",
      content: "",
      category_id: folder?.id || "",
      yaml_meta: "",
    };

    const createdNote = await ApiService.createNote(newNote);
    console.log("笔记创建成功:", createdNote);
    // TODO: 可以在这里添加成功提示或跳转到编辑页面
  } catch (err: unknown) {
    console.error("创建笔记失败:", err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "创建笔记失败";
    }
  }
};

// 生成唯一的目录名称
const generateUniqueName = (baseName: string, parentFolder?: Category): string => {
  let counter = 1;
  let existingNames: Set<string>;
  
  if (parentFolder) {
    // 如果是子目录，使用父目录的子目录名称列表
    existingNames = new Set(parentFolder.children?.map(f => f.name) || []);
  } else {
    // 如果是顶级目录，使用顶级目录名称列表
    existingNames = new Set(folders.value.map(f => f.name));
  }
  
  let newName = baseName;
  while (existingNames.has(newName)) {
    newName = `${baseName}${counter}`;
    counter++;
  }
  
  return newName;
};

// 处理新建目录
const handleCreateFolder = async () => {
  try {
    const defaultName = generateUniqueName("新建目录");
    const newCategory: Partial<Category> = {
      name: defaultName,
      parent_id: null,
    };

    const createdCategory = await ApiService.createCategory(newCategory);
    console.log("目录创建成功:", createdCategory);

    // 添加到目录列表并进入编辑状态
    const newFolder = {
      ...createdCategory,
      expanded: false,
      isEditing: true,
      editingName: defaultName,
    };
    folders.value.push(newFolder);

    // 等待 DOM 更新后聚焦输入框
    await nextTick();
    const input = renameInputs[newFolder.id];
    if (input) {
      input.focus();
      input.select();
    }

    // 清除错误信息
    error.value = null;
  } catch (err: unknown) {
    console.error("创建目录失败:", err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "创建目录失败";
    }
  }
};

// 处理排序
const handleSort = () => {
  // TODO: 实现排序逻辑
  console.log("排序");
};

// 获取目录列表
const fetchCategories = async () => {
  loading.value = true;
  error.value = null;
  try {
    const categories = await ApiService.getCategories();
    // 初始化expanded和isEditing属性
    folders.value = categories.map((category) => ({
      ...category,
      expanded: false,
      isEditing: false,
      editingName: category.name,
    }));
  } catch (err) {
    error.value = "获取目录列表失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 切换文件夹展开/折叠状态
const toggleFolder = (folder: Category & { expanded?: boolean }) => {
  folder.expanded = !folder.expanded;
};

// 开始重命名
const startRename = async (folder: Category & { isEditing?: boolean; editingName?: string }) => {
  folder.isEditing = true;
  folder.editingName = folder.name;
  await nextTick();
  const input = renameInputs[folder.id];
  if (input) {
    input.focus();
    input.select();
  }
};

// 取消重命名
const cancelRename = (folder: Category & { isEditing?: boolean; editingName?: string }) => {
  folder.isEditing = false;
  folder.editingName = folder.name;
};

// 处理重命名
const handleRename = async (folder: Category & { isEditing?: boolean; editingName?: string }) => {
  if (!folder.editingName?.trim() || folder.editingName === folder.name) {
    cancelRename(folder);
    return;
  }

  try {
    const updatedCategory = await ApiService.updateCategory(folder.id, {
      ...folder,
      name: folder.editingName.trim(),
    });

    // 更新目录信息
    Object.assign(folder, {
      ...updatedCategory,
      expanded: folder.expanded,
      isEditing: false,
    });
  } catch (err: any) {
    console.error("重命名失败:", err);
    error.value = err.message;
    cancelRename(folder);
  }
};

// 处理新建子目录
const handleCreateSubFolder = async (parentFolder: Category) => {
  try {
    const defaultName = generateUniqueName("新建目录", parentFolder);
    const newCategory: Partial<Category> = {
      name: defaultName,
      parent_id: parentFolder.id,
    };

    const createdCategory = await ApiService.createCategory(newCategory);
    console.log("目录创建成功:", createdCategory);

    // 展开父目录
    parentFolder.expanded = true;

    // 添加到父目录的子目录列表
    if (!parentFolder.children) {
      parentFolder.children = [];
    }
    const newFolder = {
      ...createdCategory,
      expanded: false,
      isEditing: true,
      editingName: defaultName,
    };
    parentFolder.children.push(newFolder);

    // 等待 DOM 更新后聚焦输入框
    await nextTick();
    const input = renameInputs[newFolder.id];
    if (input) {
      input.focus();
      input.select();
    }

    error.value = null;
  } catch (err: unknown) {
    console.error("创建目录失败:", err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "创建目录失败";
    }
  }
};

// 处理删除目录
const handleDeleteFolder = async (folder: Category) => {
  if (!confirm(`确定要删除目录"${folder.name}"吗？`)) {
    return;
  }

  try {
    await ApiService.deleteCategory(folder.id);
    
    // 从目录列表或父目录的子目录列表中移除
    if (folder.parent_id) {
      const parentFolder = folders.value.find(f => f.id === folder.parent_id);
      if (parentFolder && parentFolder.children) {
        parentFolder.children = parentFolder.children.filter(f => f.id !== folder.id);
      }
    } else {
      folders.value = folders.value.filter(f => f.id !== folder.id);
    }

    error.value = null;
  } catch (err: unknown) {
    console.error("删除目录失败:", err);
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "删除目录失败";
    }
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
/* 可以添加一些过渡动画效果 */
.transition-transform {
  transition: transform 0.2s ease-in-out;
}
</style>
