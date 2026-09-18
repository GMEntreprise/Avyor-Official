import { useEffect, useState } from 'react';
import { useUi } from '../content/context';

export interface TocItem {
  id: string;
  title: string;
}

/**
 * Sticky on desktop, a disclosure on mobile. The active section comes from an
 * IntersectionObserver rather than a scroll listener, so reading a long legal
 * page never runs a setState per pixel.
 */
export function LegalTableOfContents({ items }: { items: TocItem[] }) {
  const ui = useUi().legal;
  const [active, setActive] = useState(items[0]?.id ?? '');
  useEffect(() => {
    // The observer only says "something crossed the reading line"; the current
    // section is then the last one that has started. Reading positions in that
    // callback costs one layout per crossing, not one per scrolled pixel.
    const nodes = items
      .map(({ id }) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    const sync = () => {
      let current = nodes[0]?.id ?? '';
      for (const node of nodes) if (node.getBoundingClientRect().top <= 140) current = node.id;
      setActive(current);
    };
    const observer = new IntersectionObserver(sync, {
      rootMargin: '-140px 0px 0px 0px',
      threshold: [0, 1],
    });
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [items]);
  const list = (
    <ol>
      {items.map(({ id, title }) => (
        <li key={id}>
          <a href={`#${id}`} aria-current={active === id ? 'true' : undefined}>
            {title}
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <nav className="legal-toc" aria-label={ui.tocLabel}>
      <details className="legal-toc-mobile">
        <summary>{ui.tocLabel}</summary>
        {list}
      </details>
      <div className="legal-toc-desktop">
        <p className="eyebrow">{ui.tocTitle}</p>
        {list}
      </div>
    </nav>
  );
}
