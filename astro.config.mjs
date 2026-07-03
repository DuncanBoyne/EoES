// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.eoes.co.uk',
  integrations: [
    sitemap({
      // Exclude redirect-only pages from the sitemap
      filter: (page) => !page.includes('/team/') && !page.includes('/privatediscount/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
