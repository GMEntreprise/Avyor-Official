import type { AnchorHTMLAttributes, ElementType, PropsWithChildren } from 'react';
import { cn } from '../../lib/utils';

/**
 * A border that lights up and travels around the element on hover or focus.
 *
 * Adapted from the Aceternity component of the same name, which drives the
 * effect with React state on a permanent 1s interval. Here the travel is a
 * rotating conic gradient in CSS, so nothing re-renders, nothing keeps a timer
 * alive on every page, and `prefers-reduced-motion` is honoured by the
 * stylesheet. The API is kept so the component stays recognisable.
 *
 * The primitive knows nothing about the product: colours come from the theme
 * tokens, and the caller supplies the content.
 */
export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = 'button',
  ...props
}: PropsWithChildren<
  {
    as?: ElementType;
    containerClassName?: string;
    className?: string;
  } & AnchorHTMLAttributes<HTMLElement>
>) {
  return (
    <Tag className={cn('hbg', containerClassName)} {...props}>
      <span className="hbg-border" aria-hidden="true" />
      <span className={cn('hbg-content', className)}>{children}</span>
    </Tag>
  );
}
