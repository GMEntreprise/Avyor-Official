/**
 * Reveals `.reveal` blocks as they enter the viewport.
 *
 * Anything already on screen when this runs is marked visible *before* the
 * root class is set, so content that has already been painted never flashes
 * out and back in. Everything is a class toggle on an IntersectionObserver
 * callback: no scroll listener, no state, no work per scrolled pixel.
 */
export function startReveal() {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const blocks = document.querySelectorAll<HTMLElement>('.reveal');
  if (!blocks.length) return;
  for (const block of blocks) {
    const box = block.getBoundingClientRect();
    if (box.top < innerHeight && box.bottom > 0) block.classList.add('is-visible');
  }
  root.classList.add('motion-ready');
  const reveal = (block: Element) => {
    block.classList.add('is-visible');
    observer.unobserve(block);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
      // A jump — an anchor, "back to top", a restored position — can carry the
      // page past blocks that therefore never intersect. Anything now above the
      // viewport has been scrolled through and must not stay hidden.
      for (const block of blocks)
        if (!block.classList.contains('is-visible') && block.getBoundingClientRect().bottom < 0)
          reveal(block);
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  for (const block of blocks) if (!block.classList.contains('is-visible')) observer.observe(block);
}
