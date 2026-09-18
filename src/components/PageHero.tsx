import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { pageHeroes, type PageHeroMedia } from '../config/page-heroes';

function CinematicHero({
  slug,
  media,
  className,
  children,
}: {
  slug: string;
  media: PageHeroMedia;
  className: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const manualPause = useRef(false);
  const inView = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);

  const play = () => {
    const element = video.current;
    if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!element.getAttribute('src')) {
      element.src = matchMedia('(max-width: 700px)').matches ? media.mobileVideo : media.video;
    }
    // Autoplay can be refused by the browser. The poster and play control remain usable.
    void element.play().catch(() => {});
  };

  useEffect(() => {
    const element = video.current;
    const section = root.current;
    if (!element || !section) return;
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    let timer = 0;
    let ready = false;
    const resume = () => {
      if (motionPreference.matches) {
        element.pause();
        if (element.getAttribute('src')) {
          element.removeAttribute('src');
          element.load();
        }
      } else if (document.hidden || !inView.current) {
        element.pause();
      } else if (ready && !manualPause.current) {
        if (!element.getAttribute('src') && !connection?.saveData) {
          element.src = matchMedia('(max-width: 700px)').matches ? media.mobileVideo : media.video;
        }
        if (element.getAttribute('src')) void element.play().catch(() => {});
      }
    };
    const start = () => {
      timer = window.setTimeout(() => {
        ready = true;
        resume();
      }, 900);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      resume();
    });
    observer.observe(section);
    document.addEventListener('visibilitychange', resume);
    motionPreference.addEventListener('change', resume);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', start);
      document.removeEventListener('visibilitychange', resume);
      motionPreference.removeEventListener('change', resume);
      observer.disconnect();
      element.pause();
      element.removeAttribute('src');
      element.load();
    };
  }, [media]);

  return (
    <section ref={root} className="page-hero-surface" data-page-hero={slug}>
      <div className="page-hero-backdrop" aria-hidden="true">
        <picture>
          <source media="(max-width: 700px)" srcSet={media.mobilePoster} />
          <img src={media.poster} alt="" width="1600" height="900" fetchPriority="high" />
        </picture>
        <video
          ref={video}
          className={hasFrame ? 'has-frame' : ''}
          muted
          playsInline
          loop
          preload="none"
          tabIndex={-1}
          onPlaying={() => {
            setPlaying(true);
            setHasFrame(true);
          }}
          onPause={() => setPlaying(false)}
          onEmptied={() => setHasFrame(false)}
          onError={() => {
            setHasFrame(false);
            setPlaying(false);
          }}
        />
      </div>
      <div className={className}>{children}</div>
      <div className="page-hero-controls container">
        <button
          className="video-control"
          aria-label={playing ? 'Mettre l’arrière-plan en pause' : 'Lire l’arrière-plan'}
          onClick={() => {
            const element = video.current;
            if (!element) return;
            manualPause.current = !element.paused;
            if (element.paused) play();
            else element.pause();
          }}
        >
          {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          <span>{playing ? 'Pause' : 'Lire'}</span>
        </button>
      </div>
    </section>
  );
}

/** Keep the editorial layout unchanged on routes without a cinematic background. */
export function PageHero({
  slug,
  withDevice,
  children,
}: {
  slug: string;
  withDevice: boolean;
  children: ReactNode;
}) {
  const className = `page-hero container ${withDevice ? 'with-device' : ''}`;
  const media = pageHeroes[slug];
  return media ? (
    <CinematicHero slug={slug} media={media} className={className}>
      {children}
    </CinematicHero>
  ) : (
    <section className={className}>{children}</section>
  );
}
