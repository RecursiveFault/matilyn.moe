<script setup lang="ts">
useHead({
  // The body text size is em: 15px on phones, 14px on tablets, 13px from
  // 1024px up (with the browser's default 16px).
  bodyAttrs: {
    class:
      "m-0 bg-retro-bg bg-dots font-body text-retro-ink leading-[1.45] " +
      "text-[0.9375em] sm:text-[0.875em] lg:text-[0.8125em]",
  },
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
