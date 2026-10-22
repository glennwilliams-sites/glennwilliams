import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { Window } from 'happy-dom';

export const DIST = join(process.cwd(), 'dist');

/** Every built .html file, as a path relative to dist/ with forward slashes. */
export function builtPages(dir = DIST): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return builtPages(full);
    return name.endsWith('.html') ? [relative(DIST, full).split(sep).join('/')] : [];
  });
}

export function pageExists(path: string): boolean {
  return existsSync(join(DIST, path));
}

/** Parse a built page. `path` is relative to dist/, e.g. "index.html". */
export function loadPage(path: string): Document {
  const html = readFileSync(join(DIST, path), 'utf8');
  const window = new Window();
  return new window.DOMParser().parseFromString(html, 'text/html') as unknown as Document;
}

/** The base path the site was built with ("" for "/", "/glennwilliams" on a github.io preview), read from the nav brand link. */
export function readBase(doc: Document): string {
  const href = doc.querySelector('.nav-brand')?.getAttribute('href') ?? '/';
  return href.replace(/\/+$/, '');
}

/** Turn a site URL into a path inside dist/. Returns null for external URLs; throws if it ignores the base path. */
export function distPath(url: string, base: string): string | null {
  if (!url.startsWith('/') || url.startsWith('//')) return null;
  const clean = url.split('#')[0].split('?')[0];
  if (base && clean !== base && !clean.startsWith(base + '/')) throw new Error(`${url} does not start with the base path ${base}`);
  return decodeURIComponent(clean.slice(base.length)).replace(/^\/+/, '');
}

/** True if the path is a built file, or a folder with an index.html. */
export function builtFileExists(path: string): boolean {
  const full = join(DIST, path);
  if (!existsSync(full)) return false;
  return statSync(full).isDirectory() ? existsSync(join(full, 'index.html')) : true;
}
