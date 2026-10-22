import { parse } from 'yaml';
import { z } from 'astro/zod';
import * as schemas from './schemas';

// Vite tracks these files, so editing a YAML file reloads the dev server.
const files = import.meta.glob<string>('/src/content/**/*.yml', { query: '?raw', import: 'default', eager: true });

/** Parse one content file. Throws with the file name so a failed CI build says which form to fix. */
export function parseContent<T extends z.ZodType>(raw: string, schema: T, source: string): z.output<T> {
  let data: unknown;
  try {
    data = parse(raw);
  } catch (error) {
    throw new Error(`${source} is not valid YAML: ${(error as Error).message}`);
  }
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    throw new Error(`${source} has unexpected content:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

const cache = new Map<string, unknown>();

function loader<T extends z.ZodType>(name: string, schema: T): () => z.output<T> {
  return () => {
    if (!cache.has(name)) {
      const source = `/src/content/${name}.yml`;
      const raw = files[source];
      if (raw === undefined) throw new Error(`Missing content file ${source}`);
      cache.set(name, parseContent(raw, schema, source));
    }
    return cache.get(name) as z.output<T>;
  };
}

export const content = {
  site: loader('site', schemas.siteSchema),
  footer: loader('footer', schemas.footerSchema),
  homeHero: loader('home/hero', schemas.homeHeroSchema),
  homeFeatured: loader('home/featured', schemas.videoSectionSchema),
  homeTiles: loader('home/tiles', schemas.tilesSchema),
  actingPage: loader('acting/page', schemas.pageHeroSchema),
  actingReel: loader('acting/reel', schemas.videoSectionSchema),
  actingProjects: loader('acting/projects', schemas.projectsSchema),
  actingCredits: loader('acting/credits', schemas.creditsSchema),
  actingHeadshots: loader('acting/headshots', schemas.gallerySchema),
  voiceOverPage: loader('voice-over/page', schemas.pageHeroSchema),
  voiceOver: loader('voice-over/voice-over', schemas.voiceOverSchema),
  puppeteeringPage: loader('puppeteering/page', schemas.pageHeroSchema),
  aboutPage: loader('about/page', schemas.pageHeroSchema),
  contactPage: loader('contact/page', schemas.pageHeroSchema),
  aboutBio: loader('about/bio', schemas.textSectionSchema),
  aboutTraining: loader('about/training', schemas.textSectionSchema),
  contactInfo: loader('contact/contact', schemas.contactSchema),
  puppeteeringIntro: loader('puppeteering/intro', schemas.textSectionSchema),
  puppeteeringBackground: loader('puppeteering/background', schemas.textSectionSchema),
  puppeteeringCredits: loader('puppeteering/credits', schemas.creditsSchema),
  puppeteeringDemo: loader('puppeteering/demo', schemas.videoSectionSchema),
  puppeteeringVideos: loader('puppeteering/videos', schemas.projectsSchema),
  puppeteeringPhotos: loader('puppeteering/photos', schemas.gallerySchema),
  ozlo: loader('ozlo/ozlo', schemas.ozloSchema),
};
