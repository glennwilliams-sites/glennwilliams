// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { enhanceLightbox } from '../../src/scripts/lightbox';

describe('enhanceLightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a href="/full.webp" data-lightbox data-caption="Sacred Lies - The Boar" data-description="Puppeteered this Boar."><img alt="The boar"></a>
      <dialog id="lightbox"><button class="lightbox-close">x</button><figure><img alt=""><figcaption><strong class="lightbox-caption"></strong><span class="lightbox-description"></span></figcaption></figure></dialog>`;
    enhanceLightbox(document);
  });

  it('opens the full-size photo with its full caption', () => {
    document.querySelector<HTMLAnchorElement>('a[data-lightbox]')!.click();
    const dialog = document.querySelector('dialog')!;
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('img')!.getAttribute('src')).toBe('/full.webp');
    expect(dialog.querySelector('img')!.getAttribute('alt')).toBe('The boar');
    expect(dialog.querySelector('.lightbox-caption')!.textContent).toBe('Sacred Lies - The Boar');
    expect(dialog.querySelector('.lightbox-description')!.textContent).toBe('Puppeteered this Boar.');
  });

  it('clears the photo when the dialog closes', () => {
    document.querySelector<HTMLAnchorElement>('a[data-lightbox]')!.click();
    const dialog = document.querySelector('dialog')!;
    dialog.close();
    expect(dialog.querySelector('img')!.hasAttribute('src')).toBe(false);
  });

  it('closes from the close button', () => {
    document.querySelector<HTMLAnchorElement>('a[data-lightbox]')!.click();
    document.querySelector<HTMLButtonElement>('.lightbox-close')!.click();
    expect(document.querySelector('dialog')!.open).toBe(false);
  });
});
