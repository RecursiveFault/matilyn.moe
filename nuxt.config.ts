export default defineNuxtConfig({
  compatibilityDate: "2026-09-29",
  modules: ["@unocss/nuxt"],
  css: ["@unocss/reset/tailwind-compat.css"],
  devtools: { enabled: true },

  app: {
    // GitHub Pages under /<repo>/ sets NUXT_APP_BASE_URL at build (see the workflow)
    head: {
      htmlAttrs: { lang: "en" },
      titleTemplate: (t) => (t ? `${t} :: matilyn.moe` : "matilyn.moe"),
      meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
    },
  },

  // Server-only. Set with the NUXT_STEAM_API_KEY env var; never sent to the browser.
  runtimeConfig: {
    steamApiKey: "",
  },

  nitro: {
    prerender: { crawlLinks: true, routes: ["/"] },
  },
});
