import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Device, DemoCaption } from './Device';
import { ordinal } from '../lib/utils';
const shots = [
  ['04-feed', 'Le travail, d’abord.', 'Un feed pour découvrir les créations.'],
  ['08-portfolio', 'Votre univers, en détail.', 'Des projets réunis dans un portfolio.'],
  ['05-campaign', 'Un brief pour se comprendre.', 'Le contexte de votre prochaine création.'],
  ['06-collaboration', 'Le projet garde son fil.', 'La conversation accompagne la collaboration.'],
  [
    '03-match-detail',
    'Les raisons de la rencontre.',
    'Une lecture des informations de compatibilité.',
  ],
];
export function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const move = (d: number) =>
    ref.current?.scrollBy({
      left: d * 340,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  return (
    <section className="gallery-section">
      <div className="container gallery-heading">
        <div>
          <p className="eyebrow">05 — LE PRODUIT, SANS DÉTOUR</p>
          <h2>
            Un aperçu.
            <br />
            <span>De vraies possibilités.</span>
          </h2>
        </div>
        <div className="gallery-controls">
          <button
            className="icon-button"
            onClick={() => move(-1)}
            aria-label="Captures précédentes"
          >
            <ArrowLeft />
          </button>
          <button className="icon-button" onClick={() => move(1)} aria-label="Captures suivantes">
            <ArrowRight />
          </button>
        </div>
      </div>
      <div
        className="gallery"
        ref={ref}
        tabIndex={0}
        role="region"
        aria-label="Captures de l’application, utilisez les flèches pour parcourir"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            move(e.key === 'ArrowRight' ? 1 : -1);
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') {
            drag.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft };
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        }}
        onPointerMove={(e) => {
          if (drag.current)
            e.currentTarget.scrollLeft = drag.current.scroll - (e.clientX - drag.current.x);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {shots.map(([scene, title, body], i) => (
          <figure key={scene}>
            <div className={`gallery-device gallery-tone-${i}`}>
              <Device scene={scene} />
            </div>
            <figcaption>
              <span>{ordinal(i)}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="container">
        <DemoCaption />
      </div>
    </section>
  );
}
