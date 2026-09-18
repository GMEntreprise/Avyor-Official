import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './Navbar';
import { StoreButtons } from './StoreButtons';
import { Device } from './Device';
import { Title } from './Lines';
import { useHref, useSite } from '../content/context';
export function Footer() {
  const { content, news } = useSite();
  const ui = content.ui.footer;
  const href = useHref();
  const columns = ui.columns.map(([heading, links], i) =>
    // News sits with the other pages to explore, once it has something to read.
    i === 0 && news.enabled
      ? ([heading, [...links, [content.ui.news.label, 'news']]] as const)
      : ([heading, links] as const),
  );
  const word = useRef<SVGSVGElement>(null);
  return (
    <footer>
      <section className="final-cta container">
        <div>
          <p className="eyebrow">{ui.eyebrow}</p>
          <h2>
            <Title headline={ui.title} />
          </h2>
          <StoreButtons />
          <a className="text-link" href={href('download')}>
            {ui.link} <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-device">
          <Device scene="08-portfolio" />
        </div>
      </section>
      <div className="footer-main container">
        <div className="footer-brand">
          <Brand />
          <p>{ui.tagline}</p>
        </div>
        <nav aria-label={ui.navLabel}>
          {columns.map(([heading, links]) => (
            <div key={heading}>
              <span>{heading}</span>
              {links.map(([label, slug]) => (
                <a key={slug} href={href(slug)}>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div
        className="footer-signature container"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          word.current
            ?.querySelector('radialGradient')
            ?.setAttribute('cx', `${((e.clientX - r.left) / r.width) * 100}%`);
        }}
      >
        <svg ref={word} viewBox="0 0 1200 265" aria-hidden="true">
          <defs>
            <radialGradient id="footer-glow">
              <stop offset="0" stopColor="#A78BFA" />
              <stop offset="1" stopColor="#30364a" />
            </radialGradient>
          </defs>
          <text x="600" y="232" textAnchor="middle">
            AVYOR
          </text>
        </svg>
      </div>
      <div className="footer-bottom container">
        <span>
          © {new Date().getFullYear()} AVYOR · {ui.product}
        </span>
        <span>{ui.audience}</span>
        <a href={`${href('')}#top`}>{ui.top}</a>
      </div>
    </footer>
  );
}
