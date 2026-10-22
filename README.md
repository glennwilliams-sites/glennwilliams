# Glenn Williams

The website of Glenn Williams: actor, puppeteer, ventriloquist, voice-over artist and host in Vancouver.

## Editing the site

Everything on the site (text, photos, videos, credits, contact details) is edited through [Pages CMS](https://app.pagescms.org):

1. Sign in with your GitHub account and open this site.
2. Pick a page in the menu on the left, then the section you want to change.
3. Make your changes and press **Save**.

The site updates itself a few minutes after you save.

- **Hiding things:** leave a field empty and it disappears from the site. Every section also has a **Show this section** switch.
- **Photos:** upload them straight from your phone or computer, at any size. Give each one a short description, which is read aloud to visitors who can't see the picture.
- **Videos:** paste the normal YouTube link.

Every save is checked before it goes live. If something goes wrong, the site stays exactly as it was, so nothing you do in the editor can break it.

## For developers

Astro static site, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`, including Pages CMS saves.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm test` | Unit tests |
| `npm run build && npm run test:build` | Build to `dist/` and check the output |
| `npm run preview` | Serve `dist/` (needed to see the CSP in action) |

- `src/content/**/*.yml`: all the content, one file per section. These are what Pages CMS edits.
- `.pages.yml`: the Pages CMS forms. Every key in a content file needs a field here (a test checks).
- `src/lib/schemas.ts`: lenient schemas. An empty field means "hidden", and a half-filled form never breaks the build.
- `src/components/`: render only. No text lives in components apart from fixed UI labels.
- `src/assets/images/<folder>/`: photos, named `<where it's used>-<what it shows>.jpg`. Astro resizes them.

The tests only check that the site itself works: the build, the CSP, the nav, assets, and that every CMS form covers its content file. They never look at the content, so nothing edited in the CMS can fail them. Keep it that way.

No cookies, analytics or trackers. Videos load from youtube-nocookie.com or player.vimeo.com only after a click. The CSP in `astro.config.mjs` enforces this; don't loosen it.
