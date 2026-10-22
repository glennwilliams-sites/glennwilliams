import { z } from 'astro/zod';

// Pages CMS can save an emptied field as "", null, or drop the key, and YAML
// turns a typed "2025" into a number. These helpers normalise all of that, so
// components can treat "empty" as "hidden" with a plain truthy check.
export const text = () => z.preprocess((v) => (v == null ? '' : String(v).trim()), z.string());

export const flag = (fallback: boolean) =>
  z.preprocess((v) => (v == null || v === '' ? fallback : v), z.boolean());

export const seconds = () =>
  z.preprocess((v) => (v == null || v === '' ? 0 : Number(v)), z.number().min(0)).catch(0);

// A list row Glenn cleared instead of deleting parses to "" or an object of empty
// values. Those rows are dropped so they never render as empty links or cards.
// A field sitting at its "nothing chosen" default (photo `focus: center`) counts as empty too.
const DEFAULTS: Record<string, unknown> = { focus: 'center' };

export function isBlank(value: unknown, key = ''): boolean {
  if (value === '' || value === 0 || value === false || value == null) return true;
  if (Object.hasOwn(DEFAULTS, key) && value === DEFAULTS[key]) return true;
  if (Array.isArray(value)) return value.every((v) => isBlank(v));
  if (typeof value === 'object') return Object.entries(value).every(([k, v]) => isBlank(v, k));
  return false;
}

export const list = <T extends z.ZodType>(item: T) =>
  z.preprocess((v) => (v == null ? [] : v), z.array(item).transform((items) => items.filter((i) => !isBlank(i))));

export const group = <T extends Record<string, z.ZodType>>(shape: T) =>
  z.preprocess((v) => (v == null ? {} : v), z.object(shape));

// Shared shapes. The same in every form.
export const photo = group({
  image: text(),
  alt: text(),
  title: text(),
  description: text(),
  // Which part of the photo stays in view when it is cropped, so faces are not cut off.
  focus: z.preprocess((v) => v ?? 'center', z.enum(['top', 'center', 'bottom'])).catch('center'),
});
export const video = group({ url: text(), title: text(), thumbnail: text(), start: seconds() });
export const link = group({ label: text(), url: text() });
export const credit = group({ role: text(), production: text(), director: text() });
export const appearance = group({ production: text(), company: text() });
export const agent = group({
  role: text(),
  name: text(),
  agency: text(),
  logo: text(),
  phones: list(text()),
  emails: list(text()),
  website: text(),
});

const show = (fallback = true) => ({ show: flag(fallback) });

export const siteSchema = z.object({
  name: text(),
  seo_title: text(),
  seo_description: text(),
  share_image: text(),
  email: text(),
  phone: text(),
  socials: group({ facebook: text(), instagram: text(), x: text(), youtube: text(), imdb: text() }),
  agents: list(agent),
});

export const videoSectionSchema = z.object({ ...show(), eyebrow: text(), heading: text(), video, body: text(), links: list(link) });

export const gallerySchema = z.object({ ...show(), eyebrow: text(), heading: text(), intro: text(), photos: list(photo) });

export const voiceOverSchema = z.object({
  ...show(),
  eyebrow: text(),
  heading: text(),
  photo,
  body: text(),
  demos: list(group({ heading: text(), video, body: text() })),
});

export const projectsSchema = z.object({
  ...show(),
  eyebrow: text(),
  heading: text(),
  projects: list(group({ title: text(), video, photo, body: text(), link })),
});

export const creditsSchema = z.object({
  ...show(),
  eyebrow: text(),
  heading: text(),
  credits_title: text(),
  credits: list(credit),
  appearances_title: text(),
  appearances: list(appearance),
  links: list(link),
});

// The footer is the Contact target on every page, so it has no show switch.
export const footerSchema = z.object({ heading: text(), copyright_name: text() });

export const pageHeroSchema = z.object({
  eyebrow: text(),
  heading: text(),
  intro: text(),
  background: photo,
  seo_description: text(),
});

// A block of prose with an optional photo beside it and an optional short list.
export const textSectionSchema = z.object({
  ...show(),
  eyebrow: text(),
  heading: text(),
  photo,
  body: text(),
  points: list(text()),
});

// The Home page opens with this. It has no show switch: the page is nothing without it.
export const homeHeroSchema = z.object({
  name: text(),
  roles: list(text()),
  intro: text(),
  union: text(),
  photo,
  primary: link,
  secondary: link,
});

export const tilesSchema = z.object({
  ...show(),
  heading: text(),
  tiles: list(group({ title: text(), text: text(), photo, link })),
});

export const contactSchema = z.object({
  email_heading: text(),
  email_text: text(),
  agents_heading: text(),
  profiles_heading: text(),
  profiles: list(link),
});

export const ozloSchema = z.object({
  ...show(false),
  heading: text(),
  background: photo,
  body: text(),
  video,
  links: list(link),
  photos: list(photo),
});

export type Photo = z.output<typeof photo>;
export type Video = z.output<typeof video>;
export type Link = z.output<typeof link>;
export type Credit = z.output<typeof credit>;
export type Appearance = z.output<typeof appearance>;
export type Agent = z.output<typeof agent>;
export type Site = z.output<typeof siteSchema>;
export type ProjectsData = z.output<typeof projectsSchema>;
export type CreditsData = z.output<typeof creditsSchema>;
export type VoiceOverData = z.output<typeof voiceOverSchema>;
export type TextSectionData = z.output<typeof textSectionSchema>;
export type HomeHeroData = z.output<typeof homeHeroSchema>;
export type TilesData = z.output<typeof tilesSchema>;
