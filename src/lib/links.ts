const NOT_A_SITE_PATH = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i;

/** Prefix a site path with Astro's base: "/" on the live domain, "/glennwilliams" on a github.io preview. */
export function withBase(path: string, base: string = import.meta.env.BASE_URL ?? '/'): string {
  if (NOT_A_SITE_PATH.test(path)) return path;
  const prefix = base.endsWith('/') ? base : `${base}/`;
  // Already carries the base (a link typed with the prefix): never double it.
  if (prefix !== '/' && (path === prefix.slice(0, -1) || path.startsWith(prefix))) return path;
  return prefix + path.replace(/^\/+/, '');
}

/** "1.604.318.8104" → "tel:+16043188104". A 10-digit number gets Canada/US's leading 1. */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

/** Href for a link Glenn typed: bare domains get https://, "/page/" paths get the base. */
export function linkHref(url: string, base: string = import.meta.env.BASE_URL ?? '/'): string {
  const value = url.trim();
  if (!value) return '';
  if (value.startsWith('/') && !value.startsWith('//')) return withBase(value, base);
  if (NOT_A_SITE_PATH.test(value)) return value;
  return `https://${value}`;
}

/** Prefix root-relative href/src in rich text ("/contact/") with the base. External, "//", "#" and mailto: values are left alone. */
export function rebaseHtml(html: string, base: string = import.meta.env.BASE_URL ?? '/'): string {
  return html.replace(/(\b(?:href|src)=)(["'])(\/(?!\/)[^"']*)\2/gi, (_, attr, quote, path) => `${attr}${quote}${withBase(path, base)}${quote}`);
}

/** The bare host of a link for display: "https://www.imdb.com/name/x/" → "imdb.com". Empty if it is not a web link. */
export function displayHost(url: string): string {
  const href = linkHref(url);
  if (!/^https?:\/\//i.test(href)) return '';
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
