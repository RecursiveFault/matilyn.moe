<script setup lang="ts">
import type { AniEntry } from "~~/server/api/media.get";

defineProps<{ entries: AniEntry[]; empty: string }>();
</script>

<template>
  <table v-if="entries.length" class="data-table">
    <thead>
      <tr><th class="cell-head">Title</th><th class="cell-head">Format</th><th class="cell-head">Progress</th><th class="cell-head">Score</th></tr>
    </thead>
    <tbody>
      <tr v-for="e in entries" :key="e.url" class="even:bg-retro-alt">
        <td class="cell"><a :href="e.url">{{ e.title }}</a></td>
        <td class="cell whitespace-nowrap">{{ e.format }}</td>
        <td class="cell num">{{ e.unit }} {{ e.progress }}<template v-if="e.total">/{{ e.total }}</template></td>
        <td class="cell num">{{ e.score ?? "—" }}</td>
      </tr>
    </tbody>
  </table>
  <p v-else class="small">{{ empty }}</p>
</template>
