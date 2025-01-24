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
        @click="handleCreateNote"
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
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            @click="toggleFolder(folder)"
          >
            <!-- 展开/折叠图标 -->
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
            <span class="text-sm flex-1">{{ folder.name }}</span>
            <FolderItem />
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
                  @click.stop="toggleFolder(child)"
                >
                  <!-- 展开/折叠图标 -->
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
                  <span class="text-sm flex-1">{{ child.name }}</span>
                  <FolderItem />
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
import { ref, onMounted } from "vue";
import { ApiService, Category, Note } from "../api";
import FolderItem from "./FolderItem.vue";

// 目录列表状态
const folders = ref<Category[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// 处理新建笔记
const handleCreateNote = async () => {
  try {
    const newNote: Partial<Note> = {
      title: "新建笔记",
      content: "",
      category_id: "", // 可以根据当前选中的目录设置
      yaml_meta: "",
    };

    const createdNote = await ApiService.createNote(newNote);
    console.log("笔记创建成功:", createdNote);
    // TODO: 可以在这里添加成功提示或跳转到编辑页面
  } catch (err) {
    console.error("创建笔记失败:", err);
    // TODO: 可以在这里添加错误提示
  }
};

// 处理新建目录
const handleCreateFolder = async () => {
  try {
    const newCategory: Partial<Category> = {
      name: "新建目录",
      parent_id: null, // 可以根据当前选中的目录设置父目录
    };
    
    const createdCategory = await ApiService.createCategory(newCategory);
    console.log("目录创建成功:", createdCategory);
    
    // 清除错误信息
    error.value = null;
    // 刷新目录列表
    await fetchCategories();
  } catch (err: any) {
    console.error("创建目录失败:", err);
    // 显示错误信息
    error.value = err.message;
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
    // 初始化expanded属性
    folders.value = categories.map((category) => ({ ...category, expanded: false }));
  } catch (err) {
    error.value = "获取目录列表失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 切换文件夹展开/折叠状态
const toggleFolder = (folder: Category) => {
  folder.expanded = !folder.expanded;
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
