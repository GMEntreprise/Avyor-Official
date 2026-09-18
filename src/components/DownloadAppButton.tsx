import { ArrowDownToLine } from 'lucide-react';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { DOWNLOAD_SLUG } from '../lib/app-download';
import { useHref, useUi } from '../content/context';
import { track } from '../lib/track';

/**
 * The one download CTA of the site. Every placement is a variant of this
 * component rather than a copy of its markup, so the label, the destination
 * and the conversion signal stay in a single place — and the destination
 * follows the language the visitor is reading.
 */
export function DownloadAppButton({
  variant = 'nav',
  size = 'md',
  label,
  className,
}: {
  variant?: 'primary' | 'nav' | 'hero' | 'footer';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}) {
  const ui = useUi();
  const href = useHref();
  return (
    <HoverBorderGradient
      as="a"
      href={href(DOWNLOAD_SLUG)}
      onClick={() => track(`download_cta_${variant}`)}
      containerClassName={[`download-cta download-cta-${variant} download-cta-${size}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {label ?? ui.download.app}
      <ArrowDownToLine size={size === 'sm' ? 15 : 17} aria-hidden="true" />
    </HoverBorderGradient>
  );
}
