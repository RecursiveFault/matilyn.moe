// Pulls AniList and Steam activity. During `nuxt generate` this runs once at
// build time and the result is baked into each page's payload, so the static
// site never calls it (or sees the Steam key) from the browser.
//
// Any source that fails or isn't configured comes back with ok: false, so a
// flaky API never breaks the build. Error details are only logged, never
// returned, because Steam errors can include the request URL (and the key).

import site from "../../data/site.json";
import backloggd from "../../data/backloggd.json";

const ANILIST_QUERY = `
query ($u: String) {
  watching: Page(perPage: 10) {
    mediaList(userName: $u, type: ANIME, status_in: [CURRENT, REPEATING], sort: UPDATED_TIME_DESC) { ...entry }
  }
  reading: Page(perPage: 10) {
    mediaList(userName: $u, type: MANGA, status_in: [CURRENT, REPEATING], sort: UPDATED_TIME_DESC) { ...entry }
  }
  completed: Page(perPage: 10) {
    mediaList(userName: $u, status: COMPLETED, sort: UPDATED_TIME_DESC) { ...entry }
  }
}
fragment entry on MediaList {
  progress
  score(format: POINT_10)
  updatedAt
  completedAt { year month day }
  media { type format episodes chapters siteUrl title { userPreferred } }
}`;

export interface AniEntry {
  title: string;
  url: string;
  type: "Anime" | "Manga";
  format: string;
  progress: number;
  total: number | null;
  unit: "ep" | "ch";
  score: number | null;
  completed: string | null;
}

export interface SteamGame {
  name: string;
  url: string;
  icon: string | null;
  hours2wk: number;
  hoursTotal: number;
}

type Unavailable = { ok: false; reason: string };

interface AniListRaw {
  progress: number;
  score: number;
  completedAt: { year: number | null; month: number | null; day: number | null } | null;
  media: {
    type: "ANIME" | "MANGA";
    format: string | null;
    episodes: number | null;
    chapters: number | null;
    siteUrl: string;
    title: { userPreferred: string };
  };
}

const pad = (n: number | null) => String(n || 1).padStart(2, "0");

function toEntry(e: AniListRaw): AniEntry {
  const m = e.media;
  const anime = m.type === "ANIME";
  const c = e.completedAt;
  return {
    title: m.title.userPreferred,
    url: m.siteUrl,
    type: anime ? "Anime" : "Manga",
    format: (m.format || "").replace("_", " "),
    progress: e.progress,
    total: anime ? m.episodes : m.chapters,
    unit: anime ? "ep" : "ch",
    score: e.score || null,
    completed: c?.year ? `${c.year}-${pad(c.month)}-${pad(c.day)}` : null,
  };
}

async function anilist(user: string) {
  if (!user) return { ok: false, reason: "not configured" } as Unavailable;
  try {
    const res = await $fetch<{ data: Record<string, { mediaList: AniListRaw[] }> }>(
      "https://graphql.anilist.co",
      { method: "POST", body: { query: ANILIST_QUERY, variables: { u: user } } },
    );
    const d = res.data;
    return {
      ok: true as const,
      profile: `https://anilist.co/user/${encodeURIComponent(user)}/`,
      watching: d.watching.mediaList.map(toEntry),
      reading: d.reading.mediaList.map(toEntry),
      completed: d.completed.mediaList.map(toEntry),
    };
  } catch (err) {
    console.warn(`[media] AniList fetch failed: ${(err as Error).message}`);
    return { ok: false, reason: "fetch failed" } as Unavailable;
  }
}

async function steam(steamId: string, key: string) {
  if (!steamId) return { ok: false, reason: "not configured" } as Unavailable;
  if (!key) return { ok: false, reason: "no Steam API key" } as Unavailable;
  try {
    const res = await $fetch<{ response: { games?: any[] } }>(
      "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/",
      { query: { key, steamid: steamId, count: 10, format: "json" } },
    );
    const hours = (min: number) => Math.round((min / 60) * 10) / 10;
    return {
      ok: true as const,
      profile: `https://steamcommunity.com/profiles/${steamId}/`,
      recent: (res.response.games || []).map(
        (g): SteamGame => ({
          name: g.name,
          url: `https://store.steampowered.com/app/${g.appid}/`,
          icon: g.img_icon_url
            ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
            : null,
          hours2wk: hours(g.playtime_2weeks || 0),
          hoursTotal: hours(g.playtime_forever || 0),
        }),
      ),
    };
  } catch {
    // Deliberately not logging the error: its message contains the URL with the key.
    console.warn("[media] Steam fetch failed (check the API key, the SteamID, and that game details are public)");
    return { ok: false, reason: "fetch failed" } as Unavailable;
  }
}

// Cached for an hour so every prerendered page (and dev reloads) share one
// fetch. Nitro keeps this cache in .nuxt/cache between local builds, so the
// key includes the accounts: changing one in site.json refetches right away.
export default defineCachedEventHandler(
  async (event) => {
    const { steamApiKey } = useRuntimeConfig(event);
    const a = site.accounts;
    const [ani, stm] = await Promise.all([anilist(a.anilist), steam(a.steamId, steamApiKey)]);
    return {
      synced: new Date().toISOString(),
      anilist: ani,
      steam: stm,
      backloggd: {
        profile: a.backloggd ? `https://backloggd.com/u/${encodeURIComponent(a.backloggd)}/` : null,
        games: backloggd.games,
      },
    };
  },
  {
    maxAge: 60 * 60,
    name: "media",
    getKey: () => Object.values(site.accounts).join("|"),
  },
);
