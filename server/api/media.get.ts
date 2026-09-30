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
  lastPlayed: string | null; // ISO timestamp
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

// API URLs end up in <a href>. Vue escapes text but not link targets, so only
// pass through real https links; anything else (say, javascript:) gets the
// fallback instead.
function safeUrl(url: unknown, fallback: string): string {
  try {
    return new URL(String(url)).protocol === "https:" ? String(url) : fallback;
  } catch {
    return fallback;
  }
}

function toEntry(e: AniListRaw): AniEntry {
  const m = e.media;
  const anime = m.type === "ANIME";
  const c = e.completedAt;
  return {
    title: m.title.userPreferred,
    url: safeUrl(m.siteUrl, "https://anilist.co/"),
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
    const api = "https://api.steampowered.com/IPlayerService";
    // Recently played is sorted by hours in the last two weeks, and has no
    // last-played time. Owned games does, so fetch both and sort by that.
    // Owned games is only for sorting: if it fails, keep Steam's order.
    const [res, owned] = await Promise.all([
      $fetch<{ response: { games?: any[] } }>(`${api}/GetRecentlyPlayedGames/v1/`, {
        query: { key, steamid: steamId, count: 10, format: "json" },
      }),
      $fetch<{ response: { games?: any[] } }>(`${api}/GetOwnedGames/v1/`, {
        query: { key, steamid: steamId, include_played_free_games: 1, format: "json" },
      }).catch(() => null),
    ]);
    const lastPlayed = new Map<number, number>(
      (owned?.response.games || []).map((g) => [g.appid, g.rtime_last_played]),
    );
    const hours = (min: number) => Math.round((min / 60) * 10) / 10;
    // Skip games with under an hour in the last two weeks (a quick launch or
    // an update check), then put the most recently played first
    const games = (res.response.games || []).filter((g) => (g.playtime_2weeks || 0) >= 60).sort(
      (a, b) => (lastPlayed.get(b.appid) || 0) - (lastPlayed.get(a.appid) || 0),
    );
    return {
      ok: true as const,
      profile: `https://steamcommunity.com/profiles/${steamId}/`,
      recent: games.map((g): SteamGame => {
        const last = lastPlayed.get(g.appid);
        const appid = Number(g.appid); // goes into URLs, so make sure it's just a number
        return {
          name: g.name,
          url: `https://store.steampowered.com/app/${appid}/`,
          // The icon name is a hex hash; anything else is skipped
          icon: /^[0-9a-f]+$/i.test(g.img_icon_url || "")
            ? `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${g.img_icon_url}.jpg`
            : null,
          hours2wk: hours(g.playtime_2weeks || 0),
          hoursTotal: hours(g.playtime_forever || 0),
          lastPlayed: last ? new Date(last * 1000).toISOString() : null,
        };
      }),
    };
  } catch (err) {
    // The message contains the request URL, key included, so blank the key out
    const msg = String((err as Error).message).replaceAll(key, "***");
    console.warn(`[media] Steam fetch failed: ${msg}`);
    console.warn("[media] (check the API key, the SteamID, and that game details are public)");
    return { ok: false, reason: "fetch failed" } as Unavailable;
  }
}

// Cached for an hour so every prerendered page (and dev reloads) share one
// fetch. Nitro keeps this cache in .nuxt/cache between local builds, so the
// key includes the accounts: changing one in site.json refetches right away.
// It also notes whether a Steam key is set (never the key itself), so adding
// one doesn't keep serving the cached "no Steam API key" result.
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
    getKey: (event) =>
      [...Object.values(site.accounts), useRuntimeConfig(event).steamApiKey ? "key" : "nokey"].join("|"),
  },
);
