import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [vue()],
  output: 'static',
  // For GitHub Pages deployment - update 'portfolio2026' if your repo name differs
  site: 'https://huguesmmm.github.io',
  base: '/portfolio2026',
});
