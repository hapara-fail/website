import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

import svelte from '@astrojs/svelte';

export default defineConfig({
  site: 'https://www.hapara.fail',
  output: 'static',
  adapter: cloudflare({ imageService: 'passthrough' }),
  outDir: './dist',
  publicDir: './public',
  devToolbar: {
    enabled: false,
  },
  security: {
    checkOrigin: false,
  },
  integrations: [mdx(), sitemap(), svelte()],
  redirects: {
    '/bypass': '/services/dns',
    '/dns': '/services/dns',
    '/discord': 'https://discord.gg/KA66dHUF4P',
    '/github': 'https://github.com/hapara-fail',
  },
  vite: {
    optimizeDeps: {
      include: [
        'astro/assets/services/noop',
        'astro/content/runtime',
        'astro/zod',
        'astro/virtual-modules/transitions.js',
        'astro/virtual-modules/transitions-router.js',
        'astro/virtual-modules/transitions-types.js',
        'astro/virtual-modules/transitions-events.js',
        'astro/virtual-modules/transitions-swap-functions.js',
      ],
      exclude: ['@lucide/astro'],
    },
    ssr: {
      noExternal: ['@lucide/astro'],
    },
    server: {
      watch: {
        usePolling: process.env.VITE_USE_POLLING === 'true',
      },
    },
  },
});
