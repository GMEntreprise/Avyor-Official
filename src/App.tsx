import { LazyMotion, domAnimation } from 'motion/react';
import {
  ArrowUpRight,
  Clapperboard,
  Compass,
  MessagesSquare,
  ShieldCheck,
  Wallet,
  Layers,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Intro } from './components/Intro';
import { Hero } from './components/Hero';
import { Story } from './components/Story';
// La section film est prête mais mise en sommeil : le composant, ses styles et
// ses assets restent en place. Pour la réactiver, décommenter cet import et le
// <Film /> plus bas dans Home.
// import { Film } from './components/Film';
import { Workflow } from './components/Workflow';
import { Gallery } from './components/Gallery';
import { Faq } from './components/Faq';
import { Device, DemoCaption } from './components/Device';
import { StoreButtons } from './components/StoreButtons';
import { LegalDocument, type LegalDoc } from './components/LegalDocument';
import { Reveal } from './components/motion/Reveal';
import { track } from './lib/track';
import { Button } from './components/ui/button';
import { config } from './config';
import { pages, relatedLinks, type Page, type Section } from './content/site';

/**
 * The long-form content an inner page displays. The server has it at build
 * time; the client loads it only for the route it is actually on.
 */
export interface DeepContent {
  sectionsBySlug: Record<string, Section[]>;
  legalDocs: Record<string, LegalDoc>;
}
import { ordinal } from './lib/utils';

function Home() {
  return (
    <>
      <Hero />
      <section className="manifesto container">
        <p className="eyebrow">UNE APP. DEUX UNIVERS. LE MÊME ÉLAN.</p>
        <h2>
          Il y a des talents à découvrir.
          <br />
          Des histoires à raconter.
          <br />
          <span>Et tout ce qui peut naître entre les deux.</span>
        </h2>
        <div className="manifesto-bottom">
          <p>
            AVYOR réunit Creators et marques dans une application mobile : découvrez les créations,
            trouvez les bons profils et donnez un cadre à vos collaborations.
          </p>
          <div>
            <span>
              <Compass size={18} />
              Découvrir
            </span>
            <span>
              <Clapperboard size={18} />
              Créer
            </span>
            <span>
              <MessagesSquare size={18} />
              Collaborer
            </span>
          </div>
        </div>
      </section>
      {/* <Film /> */}
      <Story />
      <section className="audiences container" id="audiences">
        <div className="section-heading">
          <p className="eyebrow">02 — CHACUN SON UNIVERS</p>
          <h2>
            La création a deux côtés.
            <br />
            <span>AVYOR fait le lien.</span>
          </h2>
        </div>
        <div className="audience-grid">
          <article className="audience creator">
            <img
              src="/assets/media/nomad-essentials.webp"
              alt="Visuel de démonstration : création de contenu en extérieur"
              width="800"
              height="1422"
              loading="lazy"
            />
            <div>
              <p className="eyebrow">CREATORS</p>
              <h3>
                Faites parler
                <br />
                votre travail.
              </h3>
              <p>
                Un portfolio pour votre univers.
                <br />
                Des campagnes pour la suite.
              </p>
              <a
                href="/creators/"
                className="audience-link"
                onClick={() => track('creator_learn_more')}
              >
                Découvrir le parcours Creator <ArrowUpRight size={20} />
              </a>
            </div>
          </article>
          <article className="audience advertiser">
            <img
              src="/assets/media/morning-glow-routine.webp"
              alt="Visuel de démonstration : contenu beauté pour une campagne"
              width="800"
              height="1422"
              loading="lazy"
            />
            <div>
              <p className="eyebrow">MARQUES</p>
              <h3>
                Votre histoire.
                <br />
                Le bon regard.
              </h3>
              <p>
                Découvrez un style.
                <br />
                Construisez une collaboration.
              </p>
              <a
                href="/brands/"
                className="audience-link"
                onClick={() => track('advertiser_learn_more')}
              >
                Découvrir le parcours marque <ArrowUpRight size={20} />
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
            <p className="eyebrow">03 — VIDEO FIRST. TALENT FIRST.</p>
            <h2>
              Le talent se voit.
              <br />
              <span>Alors, regardez.</span>
            </h2>
            <p>
              Un regard, un montage, une façon de raconter. Découvrez ce que les Creators savent
              faire, directement dans le feed vidéo.
            </p>
            <p>Les créations passent avant les présentations.</p>
            <a className="text-link" href="/features/">
              Découvrir le feed AVYOR <ArrowUpRight size={18} />
            </a>
            <DemoCaption />
          </div>
        </div>
      </section>
      <Workflow />
      <Gallery />
      <section className="trust-section container">
        <div className="section-heading">
          <p className="eyebrow">06 — LE PROJET A UN CADRE</p>
          <h2>
            Tout le projet.
            <br />
            <span>Un seul endroit.</span>
          </h2>
          <p>
            Les échanges font avancer les idées. Des étapes claires font avancer la collaboration.
          </p>
        </div>
        <div className="trust-grid">
          {[
            [
              MessagesSquare,
              'Le contexte reste.',
              'Messages et étapes de collaboration sont réunis. Retrouvez les échanges lorsque le projet évolue.',
            ],
            [
              Wallet,
              'Le paiement se suit.',
              'La marque finance la collaboration via Stripe. Le transfert au Creator suit la validation du livrable et les conditions du projet.',
            ],
            [
              ShieldCheck,
              'Vous gardez le contrôle.',
              'Paramètres du compte, signalement, blocage et support : les actions utiles restent accessibles.',
            ],
          ].map(([Icon, title, body], i) => {
            const C = Icon as typeof Layers;
            return (
              <Reveal as="article" key={String(title)} delay={i}>
                <C size={27} strokeWidth={1.3} aria-hidden="true" />
                <h3>{String(title)}</h3>
                <p>{String(body)}</p>
              </Reveal>
            );
          })}
        </div>
        <a className="text-link" href="/security/">
          Comprendre les paiements et la sécurité <ArrowUpRight size={17} />
        </a>
      </section>
      <Faq />
    </>
  );
}

function InnerPage({ page, deep }: { page: Page; deep?: DeepContent }) {
  const sections = deep?.sectionsBySlug[page.slug] ?? [];
  return (
    <>
      <section className={`page-hero container ${page.screen ? 'with-device' : ''}`}>
        <div>
          <nav className="breadcrumb" aria-label="Fil d’Ariane">
            <a href="/">Accueil</a>
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
                Écrire à {config.email}
                <ArrowUpRight size={18} />
              </a>
            </Button>
          ) : (
            !['privacy', 'terms', 'legal', 'faq'].includes(page.slug) && (
              <Button asChild>
                <a href="/download/">
                  Découvrir AVYOR <ArrowUpRight size={18} />
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
      </section>
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
      {relatedLinks[page.slug] && (
        <div className="related-links container">
          <p>{relatedLinks[page.slug].lead}</p>
          {relatedLinks[page.slug].links.map(([label, href]) => (
            <a key={href} href={href}>
              {label} <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      )}
    </>
  );
}
export function App({ path, deep }: { path: string; deep?: DeepContent }) {
  const slug = path.replace(/^\/|\/$/g, '');
  const page = pages.find((p) => p.slug === slug);
  return (
    <LazyMotion features={domAnimation}>
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <div id="top" />
      <Navbar path={path} />
      <main id="main">
        {page ? (
          slug ? (
            <InnerPage page={page} deep={deep} />
          ) : (
            <Home />
          )
        ) : (
          <section className="not-found container">
            <p className="eyebrow">404 — HORS CHAMP</p>
            <h1>Cette page n’est plus dans le cadre.</h1>
            <p>Retrouvez le produit et les parcours AVYOR depuis l’accueil.</p>
            <Button asChild>
              <a href="/">
                Revenir à l’accueil <ArrowUpRight />
              </a>
            </Button>
          </section>
        )}
      </main>
      <Footer />
      {!slug && <Intro />}
    </LazyMotion>
  );
}
