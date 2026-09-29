<script setup lang="ts">
useHead({ title: "Media" });

const { data: media } = await useMedia();
</script>

<template>
  <template v-if="media">
    <RetroBox title="■ Media log">
      <p class="mb-1.5">
        What I'm playing, watching and reading. Steam and AniList update automatically every few hours;
        Backloggd is updated by hand.
      </p>
      <p class="small">
        ※ Last synced {{ ymd(media.synced) }} ｜
        <a v-if="media.steam.ok" :href="media.steam.profile">Steam</a><template v-else>Steam</template> ・
        <a v-if="media.anilist.ok" :href="media.anilist.profile">AniList</a><template v-else>AniList</template> ・
        <a v-if="media.backloggd.profile" :href="media.backloggd.profile">Backloggd</a><template v-else>Backloggd</template>
      </p>
    </RetroBox>

    <RetroBox title="■ Steam: recently played (2 weeks)">
      <template v-if="media.steam.ok">
        <div v-if="media.steam.recent.length" class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr><th class="cell-head">Game</th><th class="cell-head">2 wk</th><th class="cell-head">Total</th></tr>
            </thead>
            <tbody>
              <tr v-for="g in media.steam.recent" :key="g.url" class="even:bg-retro-alt">
                <td class="cell">
                  <img
                    v-if="g.icon" :src="g.icon" alt="" width="16" height="16" loading="lazy"
                    class="inline-block size-4 align-middle border border-retro-soft [image-rendering:pixelated]"
                  >
                  <a :href="g.url">{{ g.name }}</a>
                </td>
                <td class="cell num">{{ g.hours2wk }}h</td>
                <td class="cell num">{{ g.hoursTotal }}h</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="small">Nothing played in the last two weeks.</p>
      </template>
      <p v-else class="small">※ Steam unavailable ({{ media.steam.reason }}).</p>
    </RetroBox>

    <template v-if="media.anilist.ok">
      <RetroBox title="■ AniList: watching">
        <div class="overflow-x-auto"><AniTable :entries="media.anilist.watching" empty="Not watching anything right now." /></div>
      </RetroBox>
      <RetroBox title="■ AniList: reading">
        <div class="overflow-x-auto"><AniTable :entries="media.anilist.reading" empty="Not reading anything right now." /></div>
      </RetroBox>
      <RetroBox title="■ AniList: recently completed">
        <div v-if="media.anilist.completed.length" class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr><th class="cell-head">Title</th><th class="cell-head">Type</th><th class="cell-head">Finished</th><th class="cell-head">Score</th></tr>
            </thead>
            <tbody>
              <tr v-for="e in media.anilist.completed" :key="e.url" class="even:bg-retro-alt">
                <td class="cell"><a :href="e.url">{{ e.title }}</a></td>
                <td class="cell">{{ e.type }}</td>
                <td class="cell whitespace-nowrap">{{ e.completed ? ymd(e.completed) : "—" }}</td>
                <td class="cell num">{{ e.score ?? "—" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="small">Nothing completed yet.</p>
      </RetroBox>
    </template>
    <RetroBox v-else title="■ AniList">
      <p class="small">※ AniList unavailable ({{ media.anilist.reason }}).</p>
    </RetroBox>

    <RetroBox title="■ Backloggd">
      <div v-if="media.backloggd.games.length" class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th class="cell-head">Game</th><th class="cell-head">Status</th><th class="cell-head">Platform</th>
              <th class="cell-head">Rating</th><th class="cell-head">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in media.backloggd.games" :key="g.title" class="even:bg-retro-alt">
              <td class="cell"><b>{{ g.title }}</b><template v-if="g.note"><br><span class="small">{{ g.note }}</span></template></td>
              <td class="cell"><StatusBadge :status="g.status" /></td>
              <td class="cell">{{ g.platform }}</td>
              <td class="cell whitespace-nowrap">{{ g.rating != null ? stars(g.rating) : "—" }}</td>
              <td class="cell whitespace-nowrap">{{ ymd(g.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="small">No games logged.</p>
    </RetroBox>
  </template>
</template>
