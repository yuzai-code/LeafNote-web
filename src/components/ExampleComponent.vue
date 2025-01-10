<template>
  <div class="p-4">
    <!-- 按钮示例 -->
    <button class="btn btn-primary">Primary Button</button>
    <button class="btn btn-secondary">Secondary Button</button>
    <button class="btn btn-accent">Accent Button</button>

    <!-- 卡片示例 -->
    <div class="card w-96 bg-base-100 shadow-xl mt-4">
      <div class="card-body">
        <h2 class="card-title">Card Title</h2>
        <p>这是一个使用 DaisyUI 的卡片示例。</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary">确认</button>
        </div>
      </div>
    </div>

    <!-- 警告框示例 -->
    <div class="alert alert-info mt-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>这是一个信息提示框。</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加组件的逻辑
</script> 