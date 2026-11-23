// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://selfhealthliving.com',
  // Signed-in pages (login, account) are noindex and stay out of the sitemap.
  integrations: [sitemap({ filter: (page) => !/\/(login|account)\//.test(page) })],
  vite: {
    plugins: [tailwindcss()],
    // Emit every script as a file instead of inlining small ones, so the
    // Content-Security-Policy in public/_headers can forbid inline scripts.
    build: { assetsInlineLimit: 0 }
  }
});