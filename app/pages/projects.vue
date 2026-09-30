<script setup lang="ts">
import projects from "~~/data/projects.json";

useHead({ title: "Projects" });
</script>

<template>
  <RetroBox title="■ Projects index">
    <p class="mb-1.5">
      Everything I've built or am building, newest first. Each entry lists what it's made with and the
      problems that shaped it.
    </p>
    <ul>
      <li v-for="p in projects" :key="p.name" class="py-0.25">
        ▶ <a :href="`#${slugify(p.name)}`">{{ p.name }}</a> <span class="small">({{ p.category }})</span>
      </li>
    </ul>
  </RetroBox>

  <RetroBox v-for="p in projects" :id="slugify(p.name)" :key="p.name" :title="`▶ ${p.name}`">
    <dl class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
      <dt class="muted">Type</dt><dd>{{ p.category }}</dd>
      <dt class="muted">Status</dt><dd><StatusBadge :status="p.status" /></dd>
      <dt class="muted">Started</dt><dd>{{ ymd(p.started) }}</dd>
      <dt class="muted">Updated</dt><dd>{{ ymd(p.updated) }}</dd>
      <dt class="muted">Made with</dt><dd>{{ p.tech }}</dd>
    </dl>
    <p class="mt-1.5 font-bold"><RichText :text="p.desc" /></p>
    <ul class="dotted-list">
      <!-- -indent + padding makes wrapped lines hang under the text, not the ※ -->
      <li v-for="(d, i) in p.details" :key="i" class="pl-3 -indent-3">
        <span class="text-retro-accent">※ </span><RichText :text="d" />
      </li>
    </ul>
  </RetroBox>
</template>
