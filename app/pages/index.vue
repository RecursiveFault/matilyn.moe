<script setup lang="ts">
import projects from "~~/data/projects.json";
</script>

<template>
  <RetroBox title="■ Welcome">
    <p class="mb-1.5">
      Welcome to <b>matilyn.moe</b>! This is a personal site for projects, build notes and things I find
      interesting. Pages are written to be read slowly, and most of them have far more detail than they need.
    </p>
    <p class="text-em-sm muted">
      ※ This layout was designed for a 1024px-wide screen. It stays that width on larger monitors and
      switches to a stacked layout on phones.
    </p>
  </RetroBox>

  <RetroBox title="■ Projects">
    <div class="overflow-x-auto">
      <table class="data-table">
        <thead>
          <tr><th class="cell-head">Name</th><th class="cell-head">Type</th><th class="cell-head">Status</th><th class="cell-head">Updated</th></tr>
        </thead>
        <tbody>
          <tr v-for="p in projects" :key="p.name" class="even:bg-retro-alt">
            <td class="cell"><b>{{ p.name }}</b><br><span class="small"><RichText :text="p.desc" /></span></td>
            <td class="cell">{{ p.category }}</td>
            <td class="cell"><StatusBadge :status="p.status" /></td>
            <td class="cell whitespace-nowrap">{{ ymd(p.updated) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-1 text-right"><NuxtLink to="/projects">» view all projects</NuxtLink></p>
  </RetroBox>

  <div class="grid gap-1.5 md:grid-cols-2">
    <RetroBox title="■ About this site">
      <p>
        Nuxt, Vue and UnoCSS, generated to static HTML.
      </p>
    </RetroBox>
    <RetroBox title="■ Currently">
      <dl class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
        <dt class="muted">Printing</dt><dd>Solvent drip tray</dd>
        <dt class="muted">Reading</dt><dd>—</dd>
        <dt class="muted">Listening</dt><dd>—</dd>
      </dl>
    </RetroBox>
  </div>
</template>
