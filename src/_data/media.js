// Pulls AniList and Steam activity at build time.
//
// Accounts are set in site.json ("accounts"). The Steam Web API key is a secret,
// so it comes from the STEAM_API_KEY environment variable (a repo secret in CI).
// Any source that fails or isn't configured comes back empty with ok: false,
// so a flaky API never breaks the build. Error details are only logged, never
// rendered, because Steam errors can include the request URL (and the key).

import { readFileSync } from "node:fs";
import Fetch from "@11ty/eleventy-fetch";

const readJson = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));

const CACHE = "1h"; // local --serve rebuilds reuse responses for an hour

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

function toEntry(e) {
  const m = e.media;
  const total = m.type === "ANIME" ? m.episodes : m.chapters;
  const c = e.completedAt;
  return {
    title: m.title.userPreferred,
    url: m.siteUrl,
    type: m.type === "ANIME" ? "Anime" : "Manga",
    format: (m.format || "").replace("_", " "),
    progress: e.progress,
    total,
    unit: m.type === "ANIME" ? "ep" : "ch",
    score: e.score || null,
    updated: e.updatedAt ? new Date(e.updatedAt * 1000).toISOString() : null,
    completed: c && c.year ? `${c.year}-${String(c.month || 1).padStart(2, "0")}-${String(c.day || 1).padStart(2, "0")}` : null,
  };
}

async function anilist(user) {
  if (!user) return { ok: false, reason: "not configured" };
  try {
    const res = await Fetch("https://graphql.anilist.co", {
      duration: CACHE,
      type: "json",
      fetchOptions: {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: ANILIST_QUERY, variables: { u: user } }),
      },
    });
    const d = res.data;
    return {
      ok: true,
      profile: `https://anilist.co/user/${encodeURIComponent(user)}/`,
      watching: d.watching.mediaList.map(toEntry),
      reading: d.reading.mediaList.map(toEntry),
      completed: d.completed.mediaList.map(toEntry),
    };
  } catch (err) {
    console.warn(`[media] AniList fetch failed: ${err.message}`);
    return { ok: false, reason: "fetch failed" };
  }
}

async function steam(steamId, key) {
  if (!steamId) return { ok: false, reason: "not configured" };
  if (!key) return { ok: false, reason: "no STEAM_API_KEY" };
  const url =
    "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/" +
    `?key=${encodeURIComponent(key)}&steamid=${encodeURIComponent(steamId)}&count=10&format=json`;
  try {
    const res = await Fetch(url, { duration: CACHE, type: "json" });
    const games = (res.response && res.response.games) || [];
    const hours = (min) => Math.round((min / 60) * 10) / 10;
    return {
      ok: true,
      profile: `https://steamcommunity.com/profiles/${steamId}/`,
      recent: games.map((g) => ({
        name: g.name,
        url: `https://store.steampowered.com/app/${g.appid}/`,
        icon: g.img_icon_url
          ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
          : null,
        hours2wk: hours(g.playtime_2weeks || 0),
        hoursTotal: hours(g.playtime_forever || 0),
      })),
    };
  } catch {
    // Deliberately not logging err.message: it contains the URL with the key.
    console.warn("[media] Steam fetch failed (check STEAM_API_KEY, the SteamID, and that game details are public)");
    return { ok: false, reason: "fetch failed" };
  }
}

export default async function () {
  const site = readJson("./site.json");
  const backloggd = readJson("./backloggd.json");
  const a = site.accounts || {};
  const [ani, stm] = await Promise.all([anilist(a.anilist), steam(a.steamId, process.env.STEAM_API_KEY)]);
  return {
    synced: new Date().toISOString(),
    anilist: ani,
    steam: stm,
    backloggd: {
      ok: Boolean(a.backloggd),
      profile: a.backloggd ? `https://backloggd.com/u/${encodeURIComponent(a.backloggd)}/` : null,
      ...backloggd,
    },
  };
}
