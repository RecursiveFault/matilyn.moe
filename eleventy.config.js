import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");

  // Rewrites root-relative URLs (/css/style.css, /projects/) to include
  // pathPrefix, so the site works at username.github.io/<repo>/ as well as
  // on a custom domain.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // 2006-style date: 2026.09.29
  eleventyConfig.addFilter("ymd", (value) => {
    const d = value ? new Date(value) : new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  });

  return {
    dir: { input: "src", output: "_site" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
