<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <section class="box">
    <h3 class="box-title">{{ title }}</h3>
    <div class="box-body">
      <slot />
    </div>
  </section>
</template>
