import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { scenes } from '../content/site';
import { motionTokens } from '../config';
import { Device, DemoCaption } from './Device';
export function Story() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const o = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: '-25% 0px -40% 0px', threshold: 0 },
    );
    ref.current?.querySelectorAll('[data-step]').forEach((e) => o.observe(e));
    return () => o.disconnect();
  }, []);
  return (
    <section id="experience" className="story container" ref={ref}>
      <div className="section-heading">
        <p className="eyebrow">01 — LA RENCONTRE, PUIS LE PROJET</p>
        <h2>
          Moins d’outils.
          <br />
          <span>Plus de création.</span>
        </h2>
        <p>Du premier regard au projet livré, un fil continu.</p>
      </div>
      <div className="story-layout">
        <div className="story-copy">
          {scenes.map((scene, i) => (
            <article
              data-step={i}
              key={scene.id}
              className={active === i ? 'story-step active' : 'story-step'}
              id={`step-${i}`}
            >
              <span className="step-label">{scene.tag}</span>
              <h3>{scene.heading}</h3>
              <p>{scene.body}</p>
              <a className="text-link" href="/features/">
                Explorer le produit <ArrowUpRight size={16} />
              </a>
              <div className="story-mobile-device">
                <Device scene={scene.id} />
              </div>
            </article>
          ))}
        </div>
        <div className="story-visual">
          <div className="story-sticky">
            <span className="device-overline">DANS L’APP / {scenes[active].label}</span>
            <div className="story-device-stage">
              <AnimatePresence mode="sync" initial={false}>
                <m.div
                  key={active}
                  className="story-device-layer"
                  initial={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : motionTokens.normal }}
                >
                  <Device scene={scenes[active].id} />
                </m.div>
              </AnimatePresence>
            </div>
            <div className="story-progress" aria-label="Étapes du produit">
              {scenes.map((s, i) => (
                <a
                  key={s.id}
                  href={`/#step-${i}`}
                  className={i === active ? 'active' : ''}
                  aria-label={s.label}
                  aria-current={i === active ? 'step' : undefined}
                >
                  <span />
                </a>
              ))}
            </div>
            <DemoCaption />
          </div>
        </div>
      </div>
    </section>
  );
}
