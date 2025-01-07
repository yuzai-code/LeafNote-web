<template>
  <div class="home">
    <n-card title="欢迎使用 LeafNote">
      <n-space vertical>
        <n-statistic label="笔记总数">
          {{ noteCount }}
        </n-statistic>
        
        <n-statistic label="分类总数">
          {{ categoryCount }}
        </n-statistic>

        <n-divider />

        <n-button type="primary">
          开始写笔记
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
const noteCount = ref(0)
const categoryCount = ref(0)
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}
</style> 