import { defineConfig } from 'astro/config';

// CI sets these from actions/configure-pages, so a github.io preview
// (base "/glennwilliams") and the live domain (base "/") both work.
const site = process.env.SITE_URL || 'https://www.glennwilliams.ca';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  build: { format: 'directory' },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://i.ytimg.com",
        "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ],
    },
  },
});
