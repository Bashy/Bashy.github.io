import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://benjamin.pham.pm',
  integrations: [mdx()],
  redirects: {
    '/blog/ai-khong-lam-minh-nhanh-hon': '/blog/vi/ai-khong-lam-minh-nhanh-hon',
    '/blog/ai-didnt-make-me-faster': '/blog/en/ai-didnt-make-me-faster',
    '/blog/ia-ne-ma-pas-rendu-plus-rapide': '/blog/fr/ia-ne-ma-pas-rendu-plus-rapide',
    '/blog/ai-ne-ma-pas-rendu-plus-rapide': '/blog/fr/ia-ne-ma-pas-rendu-plus-rapide',
  },
});
