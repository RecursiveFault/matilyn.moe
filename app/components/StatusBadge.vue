<script setup lang="ts">
defineProps<{ status: string }>();

// Full class names written out so UnoCSS can find them. A built-up name like
// `text-status-${status}` would never be generated.
const colors: Record<string, string> = {
  active: "text-green-700",
  playing: "text-green-700",
  paused: "text-amber-700",
  shelved: "text-amber-700",
  backlog: "text-retro-steam",
  done: "text-gray-600",
  finished: "text-gray-600",
};
</script>

<template>
  <span class="px-1 text-em-xs border border-current" :class="colors[status] ?? 'text-retro-muted'">{{ status }}</span>
</template>
