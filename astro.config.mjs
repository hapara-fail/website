import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

import svelte from '@astrojs/svelte';

import { EventEmitter } from 'node:events';

EventEmitter.defaultMaxListeners = 20;

export default defineConfig({
  site: 'https://www.hapara.fail',
  output: 'static',
  adapter: cloudflare({ imageService: 'compile' }),
  outDir: './dist',
  publicDir: './public',
  integrations: [mdx(), sitemap(), svelte()],
  redirects: {
    '/bypass': '/services/dns',
    '/dns': '/services/dns',
    '/discord': 'https://discord.gg/KA66dHUF4P',
    '/github': 'https://github.com/hapara-fail',
  },
  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
});
