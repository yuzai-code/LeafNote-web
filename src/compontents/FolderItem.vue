<template>
        <!-- 添加按钮 -->
        <button class="btn btn-ghost btn-xs -mr-1" @click.stop>
            <svg class="h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
          <div class="dropdown">
          <!-- 更多操作按钮 -->
          <button class="btn btn-ghost btn-xs -ml-1" @click.stop>
            <svg class="h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01" />
            </svg>
          </button>
          <ul class="menu dropdown-content bg-base-100 rounded-box z-[1] min-w-[7rem] whitespace-nowrap p-1 shadow">
            <li><a>新建笔记</a></li>
            <li><a>新建目录</a></li>
            <li><a>重命名</a></li>
            <li><a>删除</a></li>
          </ul>
  </div>
</template>
    
<script setup lang='ts'>
    
</script>
    
<style>
    
</style>