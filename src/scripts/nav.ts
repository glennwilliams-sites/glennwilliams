/** Close the phone menu once a link is chosen (in-page anchors don't reload the page), or when Escape is pressed. */
export function enhanceNav(doc: Document): void {
  const menu = doc.querySelector<HTMLDetailsElement>('.nav-menu');
  if (!menu) return;
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.open = false;
    });
  });
  doc.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    menu.querySelector('summary')?.focus();
  });
}
