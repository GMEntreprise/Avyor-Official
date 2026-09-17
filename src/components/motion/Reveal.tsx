import type { ElementType, ReactNode } from 'react';

/**
 * Marks a block to be revealed on scroll. It renders nothing of its own: the
 * animation is CSS, driven by a class the client adds once (`src/lib/reveal.ts`).
 *
 * Two consequences, both deliberate. Without JavaScript the content is simply
 * visible — nothing is ever hidden behind an animation that may not run. And
 * revealing costs no React state and no scroll listener.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  as?: ElementType;
  /** Rank within a group, for a light stagger. Kept small on purpose. */
  delay?: number;
  className?: string;
}) {
  return (
    <Tag
      className={`reveal ${className}`.trim()}
      style={
        delay
          ? ({ '--reveal-delay': `${Math.min(delay, 4) * 60}ms` } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
