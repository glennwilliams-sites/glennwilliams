// @vitest-environment happy-dom
import nodeConsole from 'node:console';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enhanceVideos } from '../../src/scripts/video';

const markup = `<div class="video" data-embed="https://www.youtube-nocookie.com/embed/abc?autoplay=1" data-title="Reel">
  <a class="video-poster" href="https://www.youtube.com/watch?v=abc"><img alt="" src="t.jpg"><span>Play video: Reel</span></a>
</div>`;

describe('enhanceVideos', () => {
  beforeEach(() => {
    // happy-dom prints "Iframe page loading is disabled" through Node's original console (not the test runner's),
    // so that is the one to silence. The test expects the iframe to be created; the message is just noise.
    vi.spyOn(nodeConsole, 'error').mockImplementation(() => {});
    document.body.innerHTML = markup;
    enhanceVideos(document);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads nothing from the video site before a click', () => {
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('swaps the poster for the player on click', () => {
    document.querySelector<HTMLAnchorElement>('.video-poster')!.click();
    const frame = document.querySelector('iframe')!;
    expect(frame.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/abc?autoplay=1');
    expect(frame.getAttribute('title')).toBe('Reel');
    expect(frame.getAttribute('allow')).toContain('autoplay');
    expect(document.querySelector('.video-poster')).toBeNull();
  });
});
