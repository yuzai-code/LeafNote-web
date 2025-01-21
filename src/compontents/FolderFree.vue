<template>
  <!-- 搜索框 -->
  <div class="form-control mb-4">
    <input
      type="text"
      placeholder="搜索文件夹..."
      class="input input-bordered input-sm w-full"
    />
  </div>

  <!-- 加载状态 -->
  <div v-if="loading" class="flex justify-center items-center py-4">
    <div class="loading loading-spinner loading-md"></div>
  </div>

  <!-- 错误提示 -->
  <div v-else-if="error" class="alert alert-error">
    <span>{{ error }}</span>
  </div>

  <!-- 目录树 -->
  <div v-else>
    <template v-for="folder in folders" :key="folder.id">
      <!-- 文件夹项 -->
      <div class="cursor-pointer">
        <div
          class="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg"
          :class="{ 'pl-[calc(12px*var(--depth,1))]': folder.path.split('/').length - 1 }"
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
          
          <!-- 添加按钮 -->
          <button class="btn btn-ghost btn-xs -mr-1" @click.stop>
            <svg class="h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>

          <!-- 更多操作按钮 -->
          <button class="btn btn-ghost btn-xs -ml-1" @click.stop>
            <svg class="h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01" />
            </svg>
          </button>
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
                <span class="text-sm">{{ child.name }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ApiService, Category } from "../api";

// 目录列表状态
const folders = ref<Category[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// 获取目录列表
const fetchCategories = async () => {
  loading.value = true;
  error.value = null;
  try {
    const categories = await ApiService.getCategories();
    // 初始化expanded属性
    folders.value = categories.map(category => ({ ...category, expanded: false }));
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
