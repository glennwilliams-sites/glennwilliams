import type { ImageMetadata } from 'astro';
import type { Photo } from './schemas';

type ImageModules = Record<string, { default: ImageMetadata }>;
export type ResolvedPhoto = Omit<Photo, 'image'> & { image: ImageMetadata };

export function makeImageResolver(modules: ImageModules, warn: (message: string) => void = console.warn) {
  return function resolveImage(path: string): ImageMetadata | null {
    const trimmed = path.trim();
    if (!trimmed) return null;
    const found = modules[trimmed.startsWith('/') ? trimmed : `/${trimmed}`];
    if (!found) {
      warn(`[images] ${trimmed} is not in src/assets/images, so it was left out of the page.`);
      return null;
    }
    return found.default;
  };
}

export const resolveImage = makeImageResolver(
  import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
    eager: true,
  }),
);

export function resolvePhoto(photo: Photo, resolve = resolveImage): ResolvedPhoto | null {
  const image = resolve(photo.image);
  return image ? { ...photo, image } : null;
}

export function resolvePhotos(photos: Photo[], resolve = resolveImage): ResolvedPhoto[] {
  return photos.map((p) => resolvePhoto(p, resolve)).filter((p): p is ResolvedPhoto => p !== null);
}

/** Global class (base.css) that keeps the chosen part of a photo in view when it is cropped. */
export function focusClass(focus: 'top' | 'center' | 'bottom'): string {
  return `focus-${focus}`;
}
