import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { DemoCaption } from './Device';

/**
 * The AVYOR film, shown at full size rather than as a backdrop: the phones in
 * it carry real screens of the application, and that is the point of showing
 * it at all.
 *
 * The poster is painted immediately and the sources are only attached once the
 * section is approached, so a visitor who never scrolls this far pays nothing
 * for it. Reduced motion, or a browser asking for less data, keeps the poster.
 */
export function Film() {
  const video = useRef<HTMLVideoElement>(null);
  const section = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const node = section.current,
      element = video.current;
    if (!node || !element || reduced) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (connection?.saveData) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setLoaded(true);
        element.load();
        element
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      element.pause();
    };
  }, [reduced]);

  const toggle = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused)
      element
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    else {
      element.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="film-section" ref={section} id="film">
      <div className="container film-heading">
        <p className="eyebrow">AVYOR, EN CONDITIONS RÉELLES</p>
        <h2>
          Une prise de vue.
          <br />
          <span>Un projet qui démarre.</span>
        </h2>
        <p>
          Du tournage à la collaboration acceptée : les écrans que vous voyez dans le téléphone sont
          ceux de l’application.
        </p>
      </div>
      <div className="container">
        <div className="film-frame">
          <img
            src="/assets/avyor-film-poster.webp"
            width="1920"
            height="1080"
            alt="Un Creator filme un produit en studio ; son téléphone affiche l’écran des campagnes AVYOR."
            loading="lazy"
          />
          <video
            ref={video}
            className={playing ? 'is-playing' : ''}
            muted
            playsInline
            loop
            preload="none"
            aria-hidden="true"
          >
            {loaded && <source src="/assets/avyor-film.webm" type="video/webm" />}
            {loaded && <source src="/assets/avyor-film.mp4" type="video/mp4" />}
          </video>
          <button
            className="video-control film-control"
            onClick={toggle}
            aria-label={playing ? 'Mettre le film en pause' : 'Lire le film'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span>{playing ? 'Pause' : 'Lire'}</span>
          </button>
        </div>
        <div className="film-footer">
          <DemoCaption />
          <a className="text-link" href="/features/">
            Explorer le produit <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
