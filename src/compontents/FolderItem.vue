<template>
  <div class="flex items-center gap-1">
    <!-- 添加按钮 -->
    <button class="btn btn-ghost btn-xs" @click.stop="$emit('create-note')">
      <svg class="h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
    <div class="dropdown dropdown-end">
      <!-- 更多操作按钮 -->
      <label tabindex="0" class="btn btn-ghost btn-xs">
        <svg class="h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 12h.01M12 12h.01M19 12h.01"
          />
        </svg>
      </label>
      <ul
        tabindex="0"
        class="menu dropdown-content bg-base-100 rounded-box z-[1] min-w-[7rem] whitespace-nowrap p-1 shadow"
      >
        <li><a @click.stop="$emit('create-note')">新建笔记</a></li>
        <li><a @click.stop="$emit('create-folder')">新建目录</a></li>
        <li><a @click.stop="$emit('rename')">重命名</a></li>
        <li><a @click.stop="$emit('delete')" class="text-error">删除</a></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: "create-note"): void;
  (e: "create-folder"): void;
  (e: "rename"): void;
  (e: "delete"): void;
}>();
</script>

<style scoped>
.dropdown-content {
  min-width: 8rem;
}
</style>
