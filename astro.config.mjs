// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';

// Speaker profiles marked `noindex: true` in their frontmatter stay out of the sitemap.
const speakersDir = new URL('./src/content/speakers/', import.meta.url);
const noindexPages = readdirSync(speakersDir)
  .filter((f) => f.endsWith('.md') && /^noindex:\s*true\s*$/m.test(readFileSync(new URL(f, speakersDir), 'utf8')))
  .map((f) => `/speakers/${f.replace(/\.md$/, '')}/`);

// https://astro.build/config
export default defineConfig({
  site: 'https://www.eoes.co.uk',
  integrations: [
    sitemap({
      // Exclude redirect-only and noindex pages from the sitemap
      filter: (page) =>
        !page.includes('/team/') &&
        !page.includes('/privatediscount/') &&
        !noindexPages.some((p) => page.endsWith(p)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
