import { describe, expect, it } from 'vitest';
import { buildNav, type NavSource } from '../../src/lib/nav';

const sources: NavSource[] = [
  { label: 'Work', enabled: true, page: 'work' },
  { label: 'Ozlo', enabled: false, page: 'ozlo' },
  { label: 'Contact', enabled: true, page: 'contact', variant: 'button' },
];

describe('buildNav', () => {
  it('links pages under the base, drops switched-off pages, marks the current page', () => {
    expect(buildNav(sources, 'work', '/glennwilliams/')).toEqual([
      { label: 'Work', href: '/glennwilliams/work/', current: true, variant: undefined },
      { label: 'Contact', href: '/glennwilliams/contact/', current: false, variant: 'button' },
    ]);
  });
});
