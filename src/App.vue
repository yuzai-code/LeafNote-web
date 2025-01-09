<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <router-view></router-view>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { darkTheme } from 'naive-ui'
import { useTheme } from './composables/useTheme'

const { isDark } = useTheme()
const theme = computed(() => isDark.value ? darkTheme : null)
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
