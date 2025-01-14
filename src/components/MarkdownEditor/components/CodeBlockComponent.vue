<template>
  <node-view-wrapper class="code-block">
    <select
      class="absolute right-2 top-2 z-20 bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
      contenteditable="false"
      v-if="editor.isEditable"
      v-model="selectedLanguage"
      @change="updateLanguage"
    >
      <option value="">plain text</option>
      <option value="javascript">JavaScript</option>
      <option value="typescript">TypeScript</option>
      <option value="html">HTML</option>
      <option value="css">CSS</option>
      <option value="python">Python</option>
      <option value="go">Go</option>
      <option value="rust">Rust</option>
      <option value="java">Java</option>
      <option value="cpp">C++</option>
      <option value="csharp">C#</option>
    </select>
    <pre
      class="bg-gray-900 text-white p-4 rounded-lg"
      :class="{ 'ring-2 ring-blue-500': selected }"
      :spellcheck="false"
    ><node-view-content as="code" class="bg-transparent text-inherit p-0 block font-mono whitespace-pre-wrap" /></pre>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/vue-3";
import type { Editor } from "@tiptap/core";
import type { NodeViewProps } from "@tiptap/vue-3";

const props = defineProps<NodeViewProps>();

const editor = computed(() => props.editor as Editor);
const selected = computed(() => props.selected);

const selectedLanguage = computed({
  get: () => props.node.attrs.language || "",
  set: (language: string) => {
    props.updateAttributes({
      language: language || null,
    });
  },
});

const updateLanguage = () => {
  props.updateAttributes({
    language: selectedLanguage.value || null,
  });
};
</script>

<style lang="postcss">
.code-block {
  position: relative;
  margin: 0.5rem 0;

  select {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    z-index: 20;
    @apply bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm;
  }

  pre {
    @apply bg-gray-900 text-white p-4 rounded-lg;
    &.has-focus {
      @apply ring-2 ring-blue-500;
    }
  }

  code {
    @apply bg-transparent text-inherit p-0;
    display: block;
    font-family: "Fira Code", monospace;
    white-space: pre-wrap;
  }
}
</style>
