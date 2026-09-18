import { LazyMotion, domAnimation } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Navbar } from './components/Navbar';
// Illustrations only: served as images, kept out of the JavaScript bundle.
// Drawn in components/Icons3D.tsx, exported by scripts/build-icons.tsx.
import discoverIcon from './assets/icons/discover.svg';
import createIcon from './assets/icons/create.svg';
import collaborateIcon from './assets/icons/collaborate.svg';
import contextIcon from './assets/icons/context.svg';
import paymentIcon from './assets/icons/payment.svg';
import controlIcon from './assets/icons/control.svg';
import { Footer } from './components/Footer';
import { Intro } from './components/Intro';
import { Hero } from './components/Hero';
import { PageHero } from './components/PageHero';
import { Story } from './components/Story';
// La section film est prête mais mise en sommeil : le composant, ses styles et
// ses assets restent en place. Pour la réactiver, décommenter cet import et le
// <Film /> plus bas dans Home.
// import { Film } from './components/Film';
import { Workflow } from './components/Workflow';
import { Gallery } from './components/Gallery';
import { Faq } from './components/Faq';
import { NotFound } from './components/NotFound';
import { Device, DemoCaption } from './components/Device';
import { StoreButtons } from './components/StoreButtons';
import { LegalDocument } from './components/LegalDocument';
import { Lines, Title } from './components/Lines';
import { Reveal } from './components/motion/Reveal';
import { track } from './lib/track';
import { Button } from './components/ui/button';
import { config } from './config';
import { SiteProvider, useHref, useSite, useUi } from './content/context';
import type { DeepContent, Page, SiteContent } from './content/types';
import { routeFor, splitPath, type Locale } from './i18n/locales';
import { ordinal } from './lib/utils';

export type { DeepContent };

function Home() {
  const ui = useUi();
  const href = useHref();
  const pillarIcons = [discoverIcon, createIcon, collaborateIcon];
  const trustIcons = [contextIcon, paymentIcon, controlIcon];
  return (
    <>
      <Hero />
      <section className="manifesto container">
        <p className="eyebrow">{ui.manifesto.eyebrow}</p>
        <h2>
          <Title headline={ui.manifesto.title} />
        </h2>
        <div className="manifesto-bottom">
          <p>{ui.manifesto.body}</p>
          <ul className="manifesto-pillars">
            {ui.manifesto.pillars.map(([verb, detail], i) => (
              <li key={verb}>
                <img
                  src={pillarIcons[i]}
                  width="104"
                  height="104"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <strong>{verb}</strong>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      {/* <Film /> */}
      <Story />
      <section className="audiences container" id="audiences">
        <div className="section-heading">
          <p className="eyebrow">{ui.audiences.eyebrow}</p>
          <h2>
            <Title headline={ui.audiences.title} />
          </h2>
        </div>
        <div className="audience-grid">
          <article className="audience creator">
            <img
              src="/assets/media/nomad-essentials.webp"
              alt={ui.audiences.creator.alt}
              width="800"
              height="1422"
              loading="lazy"
            />
            <div>
              <p className="eyebrow">{ui.audiences.creator.eyebrow}</p>
              <h3>
                <Lines text={ui.audiences.creator.title} />
              </h3>
              <p>
                <Lines text={ui.audiences.creator.body} />
              </p>
              <a
                href={href('creators')}
                className="audience-link"
                onClick={() => track('creator_learn_more')}
              >
                {ui.audiences.creator.link} <ArrowUpRight size={20} />
              </a>
            </div>
          </article>
          <article className="audience advertiser">
            <img
              src="/assets/media/morning-glow-routine.webp"
              alt={ui.audiences.brand.alt}
              width="800"
              height="1422"
              loading="lazy"
            />
            <div>
              <p className="eyebrow">{ui.audiences.brand.eyebrow}</p>
              <h3>
                <Lines text={ui.audiences.brand.title} />
              </h3>
              <p>
                <Lines text={ui.audiences.brand.body} />
              </p>
              <a
                href={href('brands')}
                className="audience-link"
                onClick={() => track('advertiser_learn_more')}
              >
                {ui.audiences.brand.link} <ArrowUpRight size={20} />
              </a>
            </div>
          </article>
        </div>
      </section>
      <section className="feed-section">
        <div className="container feed-layout">
          <div className="feed-visual">
            <img
              className="feed-background"
              src="/assets/media/nomad-essentials.webp"
              alt=""
              width="800"
              height="1422"
              loading="lazy"
            />
            <Device scene="04-feed" />
          </div>
          <div className="feed-copy">
            <p className="eyebrow">{ui.feed.eyebrow}</p>
            <h2>
              <Title headline={ui.feed.title} />
            </h2>
            <p>{ui.feed.body}</p>
            <p>{ui.feed.note}</p>
            <a className="text-link" href={href('features')}>
              {ui.feed.link} <ArrowUpRight size={18} />
            </a>
            <DemoCaption />
          </div>
        </div>
      </section>
      <Workflow />
      <Gallery />
      <section className="trust-section container">
        <div className="section-heading">
          <p className="eyebrow">{ui.trust.eyebrow}</p>
          <h2>
            <Title headline={ui.trust.title} />
          </h2>
          <p>{ui.trust.lead}</p>
        </div>
        <div className="trust-grid">
          {ui.trust.cards.map(([title, body], i) => (
            <Reveal as="article" key={title} delay={i}>
              <img
                src={trustIcons[i]}
                width="96"
                height="96"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
        <a className="text-link" href={href('security')}>
          {ui.trust.link} <ArrowUpRight size={17} />
        </a>
      </section>
      <Faq />
    </>
  );
}

function InnerPage({ page, deep }: { page: Page; deep?: DeepContent }) {
  const { content } = useSite();
  const ui = content.ui;
  const href = useHref();
  const sections = deep?.sectionsBySlug[page.slug] ?? [];
  const related = content.related[page.slug];
  return (
    <>
      <PageHero slug={page.slug} withDevice={Boolean(page.screen)}>
        <div>
          <nav className="breadcrumb" aria-label={ui.page.breadcrumb}>
            <a href={href('')}>{ui.page.home}</a>
            <span>/</span>
            <span aria-current="page">{page.label}</span>
          </nav>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.heading}</h1>
          <p className="page-intro">{page.intro}</p>
          {page.slug === 'download' ? (
            <StoreButtons />
          ) : page.slug === 'contact' ? (
            <Button asChild>
              <a href={`mailto:${config.email}`}>
                {ui.page.writeTo} {config.email}
                <ArrowUpRight size={18} />
              </a>
            </Button>
          ) : (
            !['privacy', 'terms', 'legal', 'faq'].includes(page.slug) && (
              <Button asChild>
                <a href={href('download')}>
                  {ui.download.discover} <ArrowUpRight size={18} />
                </a>
              </Button>
            )
          )}
        </div>
        {page.screen && (
          <div className="page-device">
            <Device scene={page.screen} priority />
            <DemoCaption />
          </div>
        )}
      </PageHero>
      {['privacy', 'terms', 'legal'].includes(page.slug) ? (
        <div className="container">{deep && <LegalDocument doc={deep.legalDocs[page.slug]} />}</div>
      ) : page.slug === 'faq' ? (
        <Faq />
      ) : (
        <div className="page-sections container">
          {sections.map((s, i) => (
            <Reveal as="section" key={s.title} delay={i % 3}>
              <span className="step-number">{ordinal(i)}</span>
              <div>
                <h2>{s.title}</h2>
                <p>{s.body}</p>
                {s.items && (
                  <ul>
                    {s.items.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}
      {page.slug === 'how-it-works' && <Workflow />}
      {page.slug === 'features' && <Gallery />}
      {related && (
        <div className="related-links container">
          <p>{related.lead}</p>
          {related.links.map(([label, slug]) => (
            <a key={slug} href={href(slug)}>
              {label} <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function Shell({ path, deep }: { path: string; deep?: DeepContent }) {
  const { content, locale } = useSite();
  const { slug } = splitPath(path);
  const page = content.pages.find((p) => p.slug === slug);
  return (
    <LazyMotion features={domAnimation}>
      <a href="#main" className="skip-link">
        {content.ui.skipToContent}
      </a>
      <div id="top" />
      <Navbar path={routeFor(locale, slug)} />
      <main id="main">
        {page ? slug ? <InnerPage page={page} deep={deep} /> : <Home /> : <NotFound />}
      </main>
      <Footer />
      {!slug && page && <Intro />}
    </LazyMotion>
  );
}

export function App({
  locale,
  content,
  path,
  deep,
}: {
  locale: Locale;
  content: SiteContent;
  path: string;
  deep?: DeepContent;
}) {
  return (
    <SiteProvider value={{ locale, content }}>
      <Shell path={path} deep={deep} />
    </SiteProvider>
  );
}
