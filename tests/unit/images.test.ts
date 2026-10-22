import { describe, expect, it, vi } from 'vitest';
import type { ImageMetadata } from 'astro';
import { focusClass, makeImageResolver, resolvePhoto, resolvePhotos } from '../../src/lib/images';

const fake = (src: string) => ({ src, width: 100, height: 100, format: 'jpg' }) as ImageMetadata;
const modules = { '/src/assets/images/headshots/a.jpg': { default: fake('a') } };

describe('makeImageResolver', () => {
  it('finds an image by the path Pages CMS writes', () => {
    const resolve = makeImageResolver(modules, vi.fn());
    expect(resolve('/src/assets/images/headshots/a.jpg')?.src).toBe('a');
    expect(resolve('src/assets/images/headshots/a.jpg')?.src).toBe('a');
  });

  it('returns null for empty paths without warning', () => {
    const warn = vi.fn();
    expect(makeImageResolver(modules, warn)('')).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns and returns null for a missing file instead of failing the build', () => {
    const warn = vi.fn();
    expect(makeImageResolver(modules, warn)('/src/assets/images/gone.jpg')).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/src/assets/images/gone.jpg'));
  });
});

describe('resolvePhoto(s)', () => {
  const resolve = makeImageResolver(modules, vi.fn());
  const photo = { image: '/src/assets/images/headshots/a.jpg', alt: 'Glenn', title: 'T', description: '' };

  it('swaps the path for image metadata and keeps the text', () => {
    expect(resolvePhoto(photo, resolve)).toEqual({ ...photo, image: fake('a') });
  });

  it('drops photos whose file is missing', () => {
    expect(resolvePhotos([photo, { ...photo, image: '/nope.jpg' }], resolve)).toHaveLength(1);
  });
});

describe('focusClass', () => {
  it('maps focus to a global object-position class', () => {
    expect(focusClass('top')).toBe('focus-top');
    expect(focusClass('center')).toBe('focus-center');
    expect(focusClass('bottom')).toBe('focus-bottom');
  });
});
