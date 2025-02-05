<template>
  <div class="h-full p-4 flex flex-col">
    <!-- 搜索框 -->
    <div class="form-control mb-4 flex-none">
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

    <!-- 目录树容器 -->
    <div v-else class="flex-1 min-h-0">
      <ul class="menu menu-xs bg-base-200 rounded-lg w-full h-full overflow-y-auto overflow-x-hidden">
        <template v-for="folder in folders" :key="folder.id">
          <li>
            <details :open="folder.expanded">
              <summary @click.prevent="toggleFolder(folder)" class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-4 w-4 shrink-0"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
                </svg>
                <span class="truncate">{{ folder.name }}</span>
                <FolderItem />
              </summary>
              <ul v-if="folder.children?.length">
                <template v-for="child in folder.children" :key="child.id">
                  <li>
                    <details :open="child.expanded">
                      <summary @click.prevent="toggleFolder(child)" class="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="h-4 w-4 shrink-0"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                          />
                        </svg>
                        <span class="truncate">{{ child.name }}</span>
                        <FolderItem />
                      </summary>
                    </details>
                  </li>
                </template>
              </ul>
            </details>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ApiService, Category } from "../api";
import FolderItem from "./FolderItem.vue";

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
.menu :where(li:not(.menu-title) > *:not(ul):not(details):not(.menu-title)),
.menu :where(li:not(.menu-title) > details > summary:not(.menu-title)) {
  padding-left: calc(var(--padding-left, 1rem) + 0.5rem);
  white-space: nowrap;
}

.menu li details {
  --padding-left: calc(12px * var(--depth, 1));
}

/* 自定义滚动条样式 */
.menu {
  scrollbar-width: thin;
  scrollbar-gutter: stable;
}

.menu::-webkit-scrollbar {
  width: 4px;
  height: 0;
  display: none;
}

.menu:hover::-webkit-scrollbar {
  display: block;
}

.menu::-webkit-scrollbar-track {
  background: transparent;
}

.menu::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.menu::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

/* 确保文件夹名称不会导致布局溢出 */
.menu summary {
  min-width: 0;
  width: 100%;
}

.menu summary > span {
  flex: 1;
  min-width: 0;
}
</style>
