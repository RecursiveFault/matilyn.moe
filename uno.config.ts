import {
  defineConfig,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

// Font sizes are all em. <body> sets the base text size relative to the
// browser default (app.vue), and everything inside is relative to <body>.
// em compounds when nested, so put text-em-* on leaf elements, not on
// wrappers that contain other sized text.
//
// Spacing stays on the default rem scale (1 = 0.25rem = 4px), which doesn't
// compound.

export default defineConfig({
  presets: [
    presetWind3(),
    presetWebFonts({
      provider: "google",
      fonts: {
        // Neither Latin font has Japanese, so kana/kanji fall through to a
        // system Japanese font. Downloading Noto Sans JP instead added ~250
        // @font-face blocks (200+ KB) to the CSS.

        // font-body: main text. Condensed sans, close to Arial Narrow.
        body: [
          { name: "Roboto Condensed", weights: ["400", "700"] },
          { name: "Arial Narrow", provider: "none" },
          { name: "MS PGothic", provider: "none" },
          { name: "Hiragino Sans", provider: "none" },
          { name: "Noto Sans CJK JP", provider: "none" },
          { name: "sans-serif", provider: "none" },
        ],
        // font-mono: the sidebars (menu, profile, updates, links...)
        mono: [
          { name: "Inconsolata", weights: ["400", "700"] },
          { name: "MS Gothic", provider: "none" },
          { name: "Hiragino Sans", provider: "none" },
          { name: "Noto Sans CJK JP", provider: "none" },
          { name: "monospace", provider: "none" },
        ],
        // font-display: headings, box titles, tabs, the site title
        display: [
          { name: "DotGothic16" },
          { name: "MS PGothic", provider: "none" },
          { name: "sans-serif", provider: "none" },
        ],
      },
    }),
  ],

  transformers: [
    transformerDirectives(), // lets <style> blocks use @apply
    transformerVariantGroup(), // hover:(a b) -> hover:a hover:b
  ],

  theme: {
    colors: {
      retro: {
        bg: "#e8eef5",
        dots: "#d6e0ec",
        paper: "#ffffff",
        line: "#8fa9c4",
        soft: "#c9d6e4",
        ink: "#222222",
        muted: "#666677",
        link: "#0b3d91",
        visited: "#5a2a82",
        "title-top": "#f4f9ff",
        "title-bot": "#c9def3",
        "title-ink": "#173a63",
        accent: "#e0457b",
        alt: "#f3f7fb",
        steam: "#3a6ea5",
        anilist: "#02a9ff",
      },
    },
    // Relative to <body>'s size (12px on desktop). Comments give the px size there.
    fontSize: {
      "em-2xs": ["0.75em", "inherit"], // 9px: badges
      "em-xs": ["0.8333em", "inherit"], // 10px: dates, small print
      "em-sm": ["0.9167em", "inherit"], // 11px: notes, tagline
      "em-base": ["1em", "inherit"], // 12px
      "em-lg": ["1.5em", "inherit"], // 18px: counter
      "em-title": ["2.3333em", "inherit"], // 28px: site title
    },
  },

  rules: [
    // Named grid areas for the page frame
    [/^area-([a-z]+)$/, ([, name]) => ({ "grid-area": name })],
    ["areas-phone", { "grid-template-areas": '"head" "tabs" "main" "right" "left" "foot"' }],
    ["areas-tablet", { "grid-template-areas": '"head head" "tabs tabs" "main right" "left right" "foot foot"' }],
    ["areas-desktop", { "grid-template-areas": '"head head head" "tabs tabs tabs" "left main right" "foot foot foot"' }],

    // Dotted page background; dot spacing is 6px
    ["bg-dots", {
      "background-image": "radial-gradient(#d6e0ec 1px, transparent 1px)",
      "background-size": "0.375rem 0.375rem",
    }],
  ],

  shortcuts: {
    // The titled box used everywhere (see components/RetroBox.vue)
    box: "border border-retro-line bg-retro-paper",
    "box-title":
      "m-0 px-1.5 py-0.5 font-display text-em-base font-normal text-retro-title-ink " +
      "bg-gradient-to-b from-retro-title-top to-retro-title-bot border-b border-retro-line",
    "box-body": "p-1.5",

    // <ul> with dotted separators between items
    "dotted-list": "[&>li]:(py-0.5 border-b border-dotted border-retro-soft) [&>li:last-child]:border-b-0",

    // Tables
    "data-table": "w-full border-collapse",
    "cell-head": "border border-retro-soft px-1.25 py-0.75 text-left align-top bg-retro-title-bot text-retro-title-ink",
    cell: "border border-retro-soft px-1.25 py-0.75 text-left align-top",
    num: "text-right whitespace-nowrap tabular-nums",

    // Small print
    muted: "text-retro-muted",
    small: "text-em-xs text-retro-muted",
    badge: "inline-block px-0.75 text-em-2xs font-bold text-white",
  },

  // Global element styles that aren't worth a class on every tag. :where()
  // keeps their specificity at zero, so any utility class on a link wins.
  preflights: [
    {
      getCSS: () => `
        :where(a) { color: #0b3d91; text-decoration: underline; }
        :where(a:visited) { color: #5a2a82; }
        :where(a:hover) { color: #e0457b; }
      `,
    },
  ],
});
