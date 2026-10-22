// These tests check that the site itself is sound: the build, the CSP and privacy rules,
// the nav and the assets. They never look at what Glenn has written, so nothing he edits
// in the CMS can make them fail.
import { describe, expect, it } from 'vitest';
import { builtFileExists, builtPages, distPath, loadPage, pageExists, readBase } from './helpers';

const pages = builtPages();
const ALLOWED = new Set(['index.html', '404.html', 'acting/index.html', 'voice-over/index.html', 'puppeteering/index.html', 'about/index.html', 'contact/index.html', 'ozlo/index.html']);
/** Turn a CSP string into a map of directive name to its list of sources. */
function parseCsp(csp: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const part of csp.split(';')) {
    const [name, ...sources] = part.trim().split(/\s+/);
    if (name) map.set(name.toLowerCase(), sources);
  }
  return map;
}
const outsideRichText = (els: Iterable<Element>) => [...els].filter((el) => !el.closest('.rich-text'));

describe('built pages', () => {
  it('always include the homepage and the 404 page, and no unexpected pages', () => {
    expect(pageExists('index.html')).toBe(true);
    expect(pageExists('404.html')).toBe(true);
    expect(pages.filter((p) => !ALLOWED.has(p))).toEqual([]);
  });
});

describe.each(pages)('%s', (page) => {
  const doc = loadPage(page);
  const base = readBase(doc);

  it('is English and has a title element', () => {
    expect(doc.documentElement.getAttribute('lang')).toBe('en-CA');
    // Only that the element exists: Glenn can clear the site name and SEO title in Site settings.
    expect(doc.querySelector('title')).not.toBeNull();
  });

  it('has a strict CSP: video hosts only, no inline or wildcard sources', () => {
    const csp = doc.querySelector('meta[http-equiv="content-security-policy"]')?.getAttribute('content') ?? '';
    const d = parseCsp(csp);
    const only = (name: string, allowed: string[]) => {
      for (const src of d.get(name) ?? []) expect(allowed, `${name}: ${src}`).toContain(src);
    };
    expect(d.get('default-src')).toEqual(["'self'"]);
    expect([...(d.get('frame-src') ?? [])].sort()).toEqual(['https://player.vimeo.com', 'https://www.youtube-nocookie.com']);
    only('img-src', ["'self'", 'data:', 'https://i.ytimg.com']);
    only('font-src', ["'self'"]);
    for (const name of ['script-src', 'style-src']) {
      for (const src of d.get(name) ?? []) expect(src === "'self'" || /^'sha(256|384|512)-[A-Za-z0-9+/=_-]+'$/.test(src), `${name}: ${src}`).toBe(true);
    }
    for (const [name, sources] of d) {
      for (const src of sources) {
        expect(src, `${name}: ${src}`).not.toMatch(/\*|^https?:$|unsafe-inline|unsafe-eval/);
      }
    }
    only('connect-src', ["'self'"]);
    expect(d.get('object-src')).toEqual(["'none'"]);
    // Any other directive (base-uri, form-action, ...) must be locked down to self or none.
    for (const [name, sources] of d) {
      if (['default-src', 'frame-src', 'img-src', 'font-src', 'script-src', 'style-src', 'connect-src', 'object-src'].includes(name)) continue;
      for (const src of sources) expect(["'self'", "'none'"], `${name}: ${src}`).toContain(src);
    }
  });

  it('has the nav, main content, footer and one photo viewer', () => {
    expect(doc.querySelector('.nav')).not.toBeNull();
    expect(doc.querySelectorAll('main#main')).toHaveLength(1);
    expect(doc.querySelector('footer.footer')).not.toBeNull();
    expect(doc.querySelectorAll('dialog#lightbox')).toHaveLength(1);
  });

  it('has at most one h1 (not counting rich text)', () => {
    expect(outsideRichText(doc.querySelectorAll('h1')).length).toBeLessThanOrEqual(1);
  });

  it('has no inline style attributes outside rich text', () => {
    expect(outsideRichText(doc.querySelectorAll('[style]')).map((el) => el.tagName)).toEqual([]);
  });

  it('has no iframe until a visitor clicks a video', () => {
    expect(outsideRichText(doc.querySelectorAll('iframe'))).toHaveLength(0);
  });

  it('loads videos only from youtube-nocookie.com or player.vimeo.com', () => {
    for (const video of doc.querySelectorAll('.video')) {
      expect(video.hasAttribute('data-embed'), 'every .video needs a data-embed attribute').toBe(true);
      expect(video.getAttribute('data-embed') ?? '').toMatch(
        /^https:\/\/(www\.youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)/,
      );
    }
  });

  it('has nav links that all go somewhere', () => {
    const links = [...doc.querySelectorAll('.nav-links a, .nav-menu a')];
    expect(links.length).toBeGreaterThan(0);
    for (const a of links) {
      const href = a.getAttribute('href') ?? '';
      const [url, hash] = href.split('#');
      if (url === '') {
        expect(doc.getElementById(hash), href).not.toBeNull();
        continue;
      }
      const path = distPath(url, base);
      expect(path, href).not.toBeNull();
      expect(builtFileExists(path!), href).toBe(true);
      if (hash) {
        const target = path === '' || path!.endsWith('/') ? `${path}index.html` : path!;
        const targetDoc = target === page ? doc : loadPage(target);
        expect(targetDoc.getElementById(hash), href).not.toBeNull();
      }
    }
  });

  // Only meaningful on a github.io preview. On the live domain (no base) nothing can be doubled, and a "//host" link typed in the CMS is legitimate.
  it.skipIf(!base)('never repeats the base path in a link or source', () => {
    // "/glennwilliams/glennwilliams/work/" means a link was prefixed twice.
    const doubled = `${base}${base}`;
    const bad = outsideRichText(doc.querySelectorAll('[href], [src]'))
      .map((el) => el.getAttribute('href') ?? el.getAttribute('src') ?? '')
      .filter((url) => url === doubled || url.startsWith(`${doubled}/`));
    expect(bad).toEqual([]);
  });

  it('references only local assets that exist', () => {
    // Rich text is Glenn's own content, so its images and links are not checked here.
    const urls: string[] = [];
    const assets = doc.querySelectorAll(
      'img[src], script[src], link[rel~="stylesheet"][href], link[rel~="icon"][href], a[data-lightbox][href]',
    );
    for (const el of outsideRichText(assets)) {
      urls.push(el.getAttribute('src') ?? el.getAttribute('href') ?? '');
    }
    for (const el of outsideRichText(doc.querySelectorAll('source[srcset], img[srcset]'))) {
      for (const candidate of (el.getAttribute('srcset') ?? '').split(',')) {
        const url = candidate.trim().split(/\s+/)[0];
        if (url) urls.push(url);
      }
    }
    for (const url of urls) {
      const path = distPath(url, base);
      if (path === null) continue;
      expect(builtFileExists(path), url).toBe(true);
    }
  });

  it('has an absolute canonical link and social image', () => {
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '').toMatch(/^https?:\/\//);
    const og = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (og) expect(og).toMatch(/^https?:\/\//);
  });

  it('has valid schema.org data when it has any', () => {
    const script = doc.querySelector('script[type="application/ld+json"]');
    if (!script) return;
    expect(JSON.parse(script.textContent ?? '')['@type']).toBe('Person');
  });
});
