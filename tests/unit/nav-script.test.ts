// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { enhanceNav } from '../../src/scripts/nav';

describe('enhanceNav', () => {
  it('closes the phone menu after a link is chosen', () => {
    document.body.innerHTML = '<details class="nav-menu" open><summary>Menu</summary><ul><li><a href="#about">About</a></li></ul></details>';
    enhanceNav(document);
    document.querySelector('a')!.click();
    expect(document.querySelector('details')!.open).toBe(false);
  });

  it('closes the phone menu on Escape', () => {
    document.body.innerHTML = '<details class="nav-menu" open><summary>Menu</summary><ul><li><a href="#about">About</a></li></ul></details>';
    enhanceNav(document);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('details')!.open).toBe(false);
  });
});
