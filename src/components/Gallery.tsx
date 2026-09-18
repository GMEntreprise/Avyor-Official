import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Device, DemoCaption } from './Device';
import { Title } from './Lines';
import { useUi } from '../content/context';
import { ordinal } from '../lib/utils';
export function Gallery() {
  const ui = useUi().gallery;
  const shots = ui.shots;
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
          <p className="eyebrow">{ui.eyebrow}</p>
          <h2>
            <Title headline={ui.title} />
          </h2>
        </div>
        <div className="gallery-controls">
          <button className="icon-button" onClick={() => move(-1)} aria-label={ui.previous}>
            <ArrowLeft />
          </button>
          <button className="icon-button" onClick={() => move(1)} aria-label={ui.next}>
            <ArrowRight />
          </button>
        </div>
      </div>
      <div
        className="gallery"
        ref={ref}
        tabIndex={0}
        role="region"
        aria-label={ui.region}
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
