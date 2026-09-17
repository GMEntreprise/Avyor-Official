import { ArrowDownToLine } from 'lucide-react';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { downloadHref } from '../lib/app-download';
import { track } from '../lib/track';

/**
 * The one download CTA of the site. Every placement is a variant of this
 * component rather than a copy of its markup, so the label, the destination
 * and the conversion signal stay in a single place.
 */
export function DownloadAppButton({
  variant = 'nav',
  size = 'md',
  label = 'Télécharger l’app',
  className,
}: {
  variant?: 'primary' | 'nav' | 'hero' | 'footer';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}) {
  return (
    <HoverBorderGradient
      as="a"
      href={downloadHref}
      onClick={() => track(`download_cta_${variant}`)}
      containerClassName={[`download-cta download-cta-${variant} download-cta-${size}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
      <ArrowDownToLine size={size === 'sm' ? 15 : 17} aria-hidden="true" />
    </HoverBorderGradient>
  );
}
