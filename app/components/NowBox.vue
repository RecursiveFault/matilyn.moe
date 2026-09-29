<script setup lang="ts">
const { data: media } = await useMedia();

const games = computed(() => (media.value?.steam.ok ? media.value.steam.recent.slice(0, 3) : []));
const shows = computed(() => (media.value?.anilist.ok ? media.value.anilist.watching.slice(0, 3) : []));
</script>

<template>
  <RetroBox v-if="games.length || shows.length" title="■ Now">
    <ul class="dotted-list">
      <li v-for="g in games" :key="g.url">
        <span class="badge bg-retro-steam">PLAY</span>
        <a :href="g.url">{{ g.name }}</a>
        <span class="small"> {{ g.hours2wk }}h/2wk</span>
      </li>
      <li v-for="e in shows" :key="e.url">
        <span class="badge bg-retro-anilist">WATCH</span>
        <a :href="e.url">{{ e.title }}</a>
        <span class="small"> ep {{ e.progress }}<template v-if="e.total">/{{ e.total }}</template></span>
      </li>
    </ul>
    <p class="mt-1 text-right"><NuxtLink to="/media">» media log</NuxtLink></p>
  </RetroBox>
</template>
