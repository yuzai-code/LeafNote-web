<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { useTheme } from './composables/useTheme'

// 初始化主题
useTheme()
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
}

#app {
  height: 100vh;
  width: 100vw;
}
</style>
