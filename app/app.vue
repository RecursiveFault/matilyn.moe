<script setup lang="ts">
useHead({
  // The body text size is em: 15px on phones, 14px from 640px up
  // (with the browser's default 16px). Desktop keeps the tablet size.
  bodyAttrs: {
    class:
      "m-0 bg-retro-bg bg-dots font-body text-retro-ink leading-[1.45] " +
      "text-[0.9375em] sm:text-[0.875em]",
  },
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
