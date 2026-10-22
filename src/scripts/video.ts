/** Swap each video's poster link for the real player on click. Until then nothing loads from YouTube/Vimeo. */
export function enhanceVideos(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('.video[data-embed]').forEach((box) => {
    const poster = box.querySelector<HTMLAnchorElement>('.video-poster');
    if (!poster) return;
    poster.addEventListener('click', (event) => {
      event.preventDefault();
      const frame = document.createElement('iframe');
      frame.setAttribute('src', box.dataset.embed ?? '');
      frame.setAttribute('title', box.dataset.title || 'Video');
      frame.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      box.replaceChildren(frame);
      frame.focus();
    });
  });
}
