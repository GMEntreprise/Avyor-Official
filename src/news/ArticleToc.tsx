import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { TocEntry } from './types';

/**
 * The table of contents of an article.
 *
 * Built from `tableOfContents`, which reads the headings the body renders, so
 * no entry can point at a section that does not exist. Sticky beside the text
 * on wide screens, a disclosure above it on small ones.
 *
 * The active entry comes from an IntersectionObserver: nothing runs per
 * scrolled pixel. The current section is the last heading that has crossed the
 * reading line; before the first one the first entry is current, and once the
 * end of the article is visible, the last one is.
 */
const READING_LINE = 140;

export function ArticleToc({
  toc,
  label,
  onNavigate,
}: {
  toc: TocEntry[];
  label: string;
  onNavigate?: (id: string) => void;
}) {
  const ids = toc.flatMap((entry) => [entry.id, ...entry.children.map((child) => child.id)]);
  const [active, setActive] = useState(ids[0] ?? '');
  // The entry just clicked stays current until the reader scrolls again.
  const pinned = useRef<string | null>(null);
  const key = ids.join('|');

  useEffect(() => {
    const nodes = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    const end = document.getElementById('article-end');
    const sync = () => {
      if (pinned.current) return;
      if (end && end.getBoundingClientRect().top < window.innerHeight) {
        setActive(nodes[nodes.length - 1]?.id ?? '');
        return;
      }
      let current = nodes[0]?.id ?? '';
      for (const node of nodes)
        if (node.getBoundingClientRect().top <= READING_LINE) current = node.id;
      setActive(current);
    };
    const observer = new IntersectionObserver(sync, {
      rootMargin: `-${READING_LINE}px 0px 0px 0px`,
      threshold: [0, 1],
    });
    for (const node of nodes) observer.observe(node);
    if (end) observer.observe(end);
    // A reader's own scroll releases the entry pinned by a click.
    const release = () => {
      if (!pinned.current) return;
      pinned.current = null;
      sync();
    };
    const options = { passive: true } as const;
    addEventListener('wheel', release, options);
    addEventListener('touchmove', release, options);
    addEventListener('keydown', release);
    sync();
    return () => {
      observer.disconnect();
      removeEventListener('wheel', release);
      removeEventListener('touchmove', release);
      removeEventListener('keydown', release);
    };
  }, [key]);

  const go = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The page's scroll-padding-top keeps the heading clear of the fixed header.
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);
    // Keyboard users continue reading from the section, not from the menu.
    target.focus({ preventScroll: true });
    pinned.current = id;
    setActive(id);
    event.currentTarget.closest('details')?.removeAttribute('open');
    onNavigate?.(id);
  };

  const list = (
    <ol>
      {toc.map((entry) => (
        <li key={entry.id}>
          <a
            href={`#${entry.id}`}
            onClick={go(entry.id)}
            aria-current={active === entry.id ? 'true' : undefined}
          >
            {entry.text}
          </a>
          {entry.children.length > 0 && (
            <ol>
              {entry.children.map((child) => (
                <li key={child.id}>
                  <a
                    href={`#${child.id}`}
                    onClick={go(child.id)}
                    aria-current={active === child.id ? 'true' : undefined}
                  >
                    {child.text}
                  </a>
                </li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );

  return (
    <nav className="article-toc" aria-label={label}>
      <details className="article-toc-mobile">
        <summary>{label}</summary>
        {list}
      </details>
      <div className="article-toc-desktop">
        <p className="eyebrow">{label}</p>
        {list}
      </div>
    </nav>
  );
}
