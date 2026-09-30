<script setup lang="ts">
import site from "~~/data/site.json";
import updates from "~~/data/updates.json";
import links from "~~/data/links.json";

const route = useRoute();
// Set once while the page is prerendered, then shipped in the payload
const built = useState("built", () => new Date().toISOString());

const { display: visits } = useVisitCounter();

const trim = (p: string) => p.replace(/\/$/, "");
const isActive = (url: string) => trim(route.path) === trim(url);
</script>

<template>
  <!--
    The page frame. One column on phones, two from 640px (sm), three from
    1024px (lg). areas-* and area-* are custom rules in uno.config.ts.
  -->
  <div
    class="grid gap-1.5 p-1.5 bg-retro-paper border-y border-retro-line
           grid-cols-1 areas-phone
           sm:(grid-cols-[1fr_11.875rem] areas-tablet)
           lg:(w-[61.25rem] mx-auto my-2 border-x grid-cols-[10rem_1fr_12.5rem] areas-desktop)"
  >
    <header
      class="area-head flex flex-col gap-1 px-2.5 pt-3.5 pb-2 border border-retro-line
             bg-gradient-to-br from-[#bcd8f5] to-[#f1d4e6]
             sm:(flex-row items-end justify-between gap-0)"
    >
      <div>
        <NuxtLink to="/" class="font-display text-em-title tracking-[0.0625rem] text-retro-title-ink no-underline">
          {{ site.title }}
        </NuxtLink>
        <span class="block text-em-sm muted">{{ site.tagline }}</span>
      </div>
      <div class="text-em-sm muted sm:text-right">
        最終更新 / Last updated: <b>{{ ymd(built) }}</b>
      </div>
    </header>

    <nav class="area-tabs flex gap-0.5 border-b border-retro-line overflow-x-auto whitespace-nowrap">
      <NuxtLink
        v-for="item in site.nav"
        :key="item.url"
        :to="item.url"
        class="px-3 py-0.75 font-display no-underline border border-b-0 border-retro-line"
        :class="isActive(item.url)
          ? 'bg-retro-paper text-retro-accent'
          : 'bg-gradient-to-b from-retro-title-top to-retro-title-bot text-retro-title-ink'"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>

    <aside class="area-left flex flex-col gap-1.5 font-mono">
      <RetroBox title="■ Menu">
        <ul class="dotted-list">
          <li v-for="item in site.nav" :key="item.url">
            <NuxtLink :to="item.url" class="no-underline">▶ {{ item.label }}</NuxtLink>
          </li>
        </ul>
      </RetroBox>
      <RetroBox title="■ Profile">
        <p class="mb-1.5"><b>{{ site.author }}</b></p>
        <dl class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
          <dt class="muted">Printer</dt><dd>prusa MK4IS</dd>
          <dt class="muted">Likes</dt><dd>honduran coffee, potato soup, my wife, photography, hiking, cooking, miniature games</dd>
        </dl>
      </RetroBox>
    </aside>

    <!-- min-w-0 lets wide tables scroll instead of stretching the column -->
    <main class="area-main min-w-0 flex flex-col gap-1.5">
      <slot />
    </main>

    <aside class="area-right flex flex-col gap-1.5 font-mono">
      <NowBox />
      <RetroBox title="■ 最新情報 / Updates">
        <ul class="dotted-list">
          <li v-for="u in updates" :key="u.date + u.text">
            <span class="small">{{ ymd(u.date) }}</span> {{ u.text }}
            <span v-if="u.new" class="badge bg-retro-accent">NEW!</span>
          </li>
        </ul>
      </RetroBox>
      <RetroBox title="■ Links">
        <template v-for="g in links" :key="g.group">
          <p class="font-bold mt-1 first:mt-0 mb-0.5">{{ g.group }}</p>
          <ul class="dotted-list">
            <li v-for="l in g.items" :key="l.url">・<a :href="l.url">{{ l.label }}</a></li>
          </ul>
        </template>
      </RetroBox>
      <RetroBox title="■ Counter">
        <p class="font-display text-em-lg tracking-[0.1875rem] text-center bg-[#111] text-[#6f6] py-0.5">{{ visits }}</p>
        <p class="small mt-1">※ visits, counted once per session</p>
      </RetroBox>
    </aside>

    <footer class="area-foot text-center text-em-xs muted border-t border-retro-line pt-1.5">
      Copyleft {{ built.slice(0, 4) }} {{ site.author }}. Some rights reserved.
      ｜ Best viewed on CRT.
    </footer>
  </div>
</template>
