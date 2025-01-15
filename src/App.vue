<template>
  <div class="app-container">
    <MarkdownEditor />
  </div>
</template>

<script setup lang="ts">
import MarkdownEditor from './components/MarkdownEditor.vue'
</script>

<style>
.app-container {
  padding: 20px;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>
