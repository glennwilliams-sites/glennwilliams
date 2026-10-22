import { withBase } from './links';

export type NavSource = { label: string; enabled: boolean; page: string; variant?: 'button' };
export interface NavItem { label: string; href: string; current: boolean; variant?: 'button' }

/** Nav links are pages; a switched-off page (Ozlo) loses its link. */
export function buildNav(sources: NavSource[], currentPage: string, base: string = import.meta.env.BASE_URL ?? '/'): NavItem[] {
  return sources
    .filter((s) => s.enabled)
    .map((s) => ({ label: s.label, href: withBase(`${s.page}/`, base), current: currentPage === s.page, variant: s.variant }));
}
