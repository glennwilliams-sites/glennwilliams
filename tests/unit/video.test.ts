import { describe, expect, it } from 'vitest';
import { embedUrl, parseVideoUrl, watchUrl, youtubeThumbnail } from '../../src/lib/video';

describe('parseVideoUrl', () => {
  it.each([
    ['https://www.youtube.com/watch?v=cvTHW_5FuAw', 'cvTHW_5FuAw'],
    ['https://youtube.com/watch?v=lp98X-9x144&t=30s', 'lp98X-9x144'],
    ['https://m.youtube.com/watch?v=lwy2bemRapI', 'lwy2bemRapI'],
    ['https://youtu.be/ktRld__io9w?si=abc', 'ktRld__io9w'],
    ['https://www.youtube.com/shorts/eiVkW3GDEmE', 'eiVkW3GDEmE'],
    ['https://www.youtube-nocookie.com/embed/34PAfZI3NlQ', '34PAfZI3NlQ'],
    ['youtube.com/watch?v=9f06QZCVUHg', '9f06QZCVUHg'],
  ])('reads YouTube link %s', (url, id) => {
    expect(parseVideoUrl(url)).toEqual({ provider: 'youtube', id });
  });

  it.each([
    ['https://vimeo.com/834901913', '834901913'],
    ['https://player.vimeo.com/video/834901913?h=abc', '834901913'],
    ['vimeo.com/834901913', '834901913'],
  ])('reads Vimeo link %s', (url, id) => {
    expect(parseVideoUrl(url)).toEqual({ provider: 'vimeo', id });
  });

  it.each(['', '   ', 'not a url', 'https://example.com/watch?v=cvTHW_5FuAw', 'https://www.youtube.com/watch?v=short'])(
    'returns null for %j',
    (url) => {
      expect(parseVideoUrl(url)).toBeNull();
    },
  );
});

describe('embedUrl', () => {
  it('uses youtube-nocookie with autoplay and no related videos', () => {
    expect(embedUrl({ provider: 'youtube', id: 'cvTHW_5FuAw' })).toBe(
      'https://www.youtube-nocookie.com/embed/cvTHW_5FuAw?autoplay=1&rel=0',
    );
  });

  it('adds a whole-second start time for YouTube', () => {
    expect(embedUrl({ provider: 'youtube', id: '9f06QZCVUHg' }, 115.6)).toBe(
      'https://www.youtube-nocookie.com/embed/9f06QZCVUHg?autoplay=1&rel=0&start=115',
    );
  });

  it('uses Vimeo do-not-track and a #t= start time', () => {
    expect(embedUrl({ provider: 'vimeo', id: '834901913' })).toBe(
      'https://player.vimeo.com/video/834901913?autoplay=1&dnt=1',
    );
    expect(embedUrl({ provider: 'vimeo', id: '834901913' }, 20)).toBe(
      'https://player.vimeo.com/video/834901913?autoplay=1&dnt=1#t=20s',
    );
  });
});

describe('watchUrl / youtubeThumbnail', () => {
  it('links to the normal watch page (used when JavaScript is off)', () => {
    expect(watchUrl({ provider: 'youtube', id: 'cvTHW_5FuAw' })).toBe('https://www.youtube.com/watch?v=cvTHW_5FuAw');
    expect(watchUrl({ provider: 'youtube', id: '9f06QZCVUHg' }, 115)).toBe(
      'https://www.youtube.com/watch?v=9f06QZCVUHg&t=115s',
    );
    expect(watchUrl({ provider: 'vimeo', id: '834901913' })).toBe('https://vimeo.com/834901913');
  });

  it('uses the hqdefault thumbnail from i.ytimg.com', () => {
    expect(youtubeThumbnail('cvTHW_5FuAw')).toBe('https://i.ytimg.com/vi/cvTHW_5FuAw/hqdefault.jpg');
  });
});
