/** Open gallery photos full-size in the page's single <dialog id="lightbox">. Without JS the links open the image. */
export function enhanceLightbox(doc: Document): void {
  const dialog = doc.getElementById('lightbox') as HTMLDialogElement | null;
  if (!dialog) return;
  const image = dialog.querySelector('img')!;
  const caption = dialog.querySelector('.lightbox-caption')!;
  const description = dialog.querySelector('.lightbox-description')!;

  doc.querySelectorAll<HTMLAnchorElement>('a[data-lightbox]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      image.setAttribute('src', link.getAttribute('href') ?? '');
      image.setAttribute('alt', link.querySelector('img')?.getAttribute('alt') ?? '');
      caption.textContent = link.dataset.caption ?? '';
      description.textContent = link.dataset.description ?? '';
      dialog.showModal();
    });
  });

  // Clear the photo on close so the next one doesn't flash the previous.
  dialog.addEventListener('close', () => image.removeAttribute('src'));

  dialog.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (target === dialog || target.closest('.lightbox-close')) dialog.close();
  });
}
