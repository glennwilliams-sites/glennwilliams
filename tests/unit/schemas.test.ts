import { describe, expect, it } from 'vitest';
import { parseContent } from '../../src/lib/content';
import { creditsSchema, gallerySchema, homeHeroSchema, isBlank, ozloSchema, pageHeroSchema, photo, projectsSchema, siteSchema, textSectionSchema, tilesSchema, videoSectionSchema } from '../../src/lib/schemas';

describe('lenient section schemas', () => {
  it('turns a missing, null or empty field into the "hidden" value', () => {
    const data = parseContent('heading:\nvideo:\n  url: ""\n', videoSectionSchema, 'test.yml');
    expect(data).toEqual({
      show: true,
      eyebrow: '',
      heading: '',
      video: { url: '', title: '', thumbnail: '', start: 0 },
      body: '',
      links: [],
    });
  });

  it('treats an empty file as all defaults', () => {
    expect(parseContent('', gallerySchema, 'test.yml')).toEqual({ show: true, eyebrow: '', heading: '', intro: '', photos: [] });
  });

  it('keeps Ozlo switched off unless show is set', () => {
    expect(parseContent('heading: Ozlo', ozloSchema, 'test.yml').show).toBe(false);
    expect(parseContent('show: true', ozloSchema, 'test.yml').show).toBe(true);
  });

  it('coerces numbers typed into text fields and trims whitespace', () => {
    const data = parseContent('name: 2025\nemail: "  glenn@glennwilliams.ca "\n', siteSchema, 'site.yml');
    expect(data.name).toBe('2025');
    expect(data.email).toBe('glenn@glennwilliams.ca');
  });

  it('fills defaults inside list items', () => {
    const data = parseContent('projects:\n  - title: Look Up\n', projectsSchema, 'p.yml');
    expect(data.projects[0]).toEqual({
      title: 'Look Up',
      video: { url: '', title: '', thumbnail: '', start: 0 },
      photo: { image: '', alt: '', title: '', description: '', focus: 'center' },
      body: '',
      link: { label: '', url: '' },
    });
  });

  it('treats a non-numeric start time as 0', () => {
    const data = parseContent('video:\n  start: soon\n', videoSectionSchema, 'v.yml');
    expect(data.video.start).toBe(0);
  });

  it('names the file when YAML is broken', () => {
    expect(() => parseContent('heading: [unclosed', videoSectionSchema, 'home/thundermans.yml')).toThrow(
      /home\/thundermans\.yml is not valid YAML/,
    );
  });

  it('names the file when the shape is wrong', () => {
    expect(() => parseContent('photos: "not a list"', gallerySchema, 'home/headshots.yml')).toThrow(
      /home\/headshots\.yml has unexpected content/,
    );
  });

  describe('blank list rows', () => {
    it('drops empty strings and nulls from a list of text', () => {
      const data = parseContent('points: ["Marionettes", "", null]\n', textSectionSchema, 't.yml');
      expect(data.points).toEqual(['Marionettes']);
    });

    it('drops a photo row whose fields are all empty', () => {
      const yaml = 'photos:\n  - image: ""\n    alt: ""\n    title: ""\n    description: ""\n  - image: /a.jpg\n';
      const data = parseContent(yaml, gallerySchema, 'g.yml');
      expect(data.photos.map((p) => p.image)).toEqual(['/a.jpg']);
    });

    it('drops a project whose only value is a zero start time', () => {
      const yaml = 'projects:\n  - video:\n      start: 0\n  - title: Look Up\n';
      const data = parseContent(yaml, projectsSchema, 'p.yml');
      expect(data.projects.map((p) => p.title)).toEqual(['Look Up']);
    });

    it('keeps a credit that has only a role', () => {
      const yaml = 'credits:\n  - role: ACTOR\n  - role: ""\n    production: ""\n';
      const data = parseContent(yaml, creditsSchema, 'p.yml');
      expect(data.credits).toEqual([{ role: 'ACTOR', production: '', director: '' }]);
    });
  });
});

describe('photo focus', () => {
  it('defaults to center and falls back to center for unknown values', () => {
    expect(photo.parse({ image: 'a.jpg' }).focus).toBe('center');
    expect(photo.parse({ image: 'a.jpg', focus: 'top' }).focus).toBe('top');
    expect(photo.parse({ image: 'a.jpg', focus: 'sideways' }).focus).toBe('center');
  });

  it('drops a photo row that only has the default focus', () => {
    const data = parseContent('photos:\n  - focus: center\n', gallerySchema, 'g.yml');
    expect(data.photos).toEqual([]);
  });
});

describe('pageHeroSchema', () => {
  it('fills every field when the file is empty', () => {
    expect(parseContent('', pageHeroSchema, 'p.yml')).toEqual({
      eyebrow: '', heading: '', intro: '', seo_description: '',
      background: { image: '', alt: '', title: '', description: '', focus: 'center' },
    });
  });
});

describe('work schemas', () => {
  it('projects default to an empty, shown section', () => {
    expect(parseContent('', projectsSchema, 'p.yml')).toEqual({ show: true, eyebrow: '', heading: '', projects: [] });
  });
  it('credits keep credit rows and drop blank ones', () => {
    const d = parseContent('credits:\n  - role: Puppeteer\n    production: Look Up\n  - role: ""\n', creditsSchema, 'c.yml');
    expect(d.credits).toEqual([{ role: 'Puppeteer', production: 'Look Up', director: '' }]);
    expect(d.links).toEqual([]);
  });
});

describe('textSectionSchema', () => {
  it('drops blank points', () => {
    expect(parseContent('points:\n  - Marionettes\n  - ""\n', textSectionSchema, 't.yml').points).toEqual(['Marionettes']);
  });
  it('is a shown, empty section when the file is empty', () => {
    const d = parseContent('', textSectionSchema, 't.yml');
    expect(d.show).toBe(true);
    expect(d.points).toEqual([]);
    expect(d.photo.image).toBe('');
  });
});

import { contactSchema } from '../../src/lib/schemas';
describe('contactSchema', () => {
  it('defaults to empty text and no profiles', () => {
    expect(parseContent('', contactSchema, 'c.yml')).toEqual({ email_heading: '', email_text: '', agents_heading: '', profiles_heading: '', profiles: [] });
  });
  it('drops blank profile rows', () => {
    const d = parseContent('profiles:\n  - label: IMDb\n    url: https://imdb.com\n  - label: ""\n    url: ""\n', contactSchema, 'c.yml');
    expect(d.profiles).toEqual([{ label: 'IMDb', url: 'https://imdb.com' }]);
  });
});

describe('home schemas', () => {
  it('home hero drops blank roles', () => {
    expect(parseContent('roles:\n  - Actor\n  - ""\n', homeHeroSchema, 'h.yml').roles).toEqual(['Actor']);
  });
  it('home hero is all empty when the file is empty', () => {
    const d = parseContent('', homeHeroSchema, 'h.yml');
    expect(d.roles).toEqual([]);
    expect(d.primary).toEqual({ label: '', url: '' });
    expect(d.photo.image).toBe('');
  });
  it('tiles drop blank rows', () => {
    expect(parseContent('tiles:\n  - title: Work\n  - {}\n', tilesSchema, 't.yml').tiles).toHaveLength(1);
  });
  it('tiles drop a row that only has the default photo focus', () => {
    expect(parseContent('tiles:\n  - photo:\n      focus: center\n', tilesSchema, 't.yml').tiles).toEqual([]);
  });
});

describe('isBlank', () => {
  it('does not treat inherited object keys as defaults', () => {
    expect(isBlank({ constructor: Object })).toBe(false);
    expect(isBlank({ focus: 'center' })).toBe(true);
  });
});
