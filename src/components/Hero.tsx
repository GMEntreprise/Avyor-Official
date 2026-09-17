import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, m } from 'motion/react';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { DownloadAppButton } from './DownloadAppButton';
import { StoreButtons } from './StoreButtons';
import { Device, DemoCaption } from './Device';
export function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = video.current;
    if (!v || reduced) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    let timer = 0;
    const start = () => {
      timer = window.setTimeout(() => {
        v.src = matchMedia('(max-width: 700px)').matches
          ? '/assets/hero-mobile.mp4'
          : '/assets/hero-desktop.mp4';
        v.play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      }, 1200);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', start);
      v.pause();
    };
  }, [reduced]);
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      if (!v.getAttribute('src'))
        v.src = matchMedia('(max-width: 700px)').matches
          ? '/assets/hero-mobile.mp4'
          : '/assets/hero-desktop.mp4';
      v.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      v.pause();
      setPlaying(false);
    }
  };
  return (
    <section className="hero">
      <div className="hero-backdrop">
        <img src="/assets/hero-poster.webp" width="1440" height="900" alt="" fetchPriority="high" />
        <video
          ref={video}
          muted
          playsInline
          loop
          preload="none"
          poster="/assets/hero-poster.webp"
          aria-hidden="true"
        />
      </div>
      <div className="hero-grid container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            LA CRÉATION FAIT LA RENCONTRE
          </p>
          <h1>
            Le bon Creator.
            <br />
            <span>
              La bonne
              <br className="desktop-break" /> campagne.
            </span>
          </h1>
          <p className="hero-description">
            Creators et marques, trouvez-vous.
            <br />
            Créez ensemble. Gardez le projet au même endroit.
          </p>
          <div className="hero-actions">
            <DownloadAppButton variant="hero" label="Télécharger l’app" />
            <a className="quiet-link" href="/#experience">
              Voir comment ça marche <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
          <StoreButtons />
        </div>
        <m.div className="hero-product" initial={false} animate={{ y: 0 }}>
          <div className="hero-orbit" />
          <div className="device-tag tag-top">
            <span>LE TALENT SE VOIT.</span>
            <ArrowUpRight size={17} />
          </div>
          <Device scene="02-matching" className="hero-device-back" priority />
          <Device scene="04-feed" className="hero-device-front" priority />
          <div className="device-tag tag-bottom">
            <span className="tag-rule" />
            <span>LA RENCONTRE SE CRÉE.</span>
          </div>
        </m.div>
      </div>
      <div className="hero-bottom container">
        <a href="/#experience">
          <span className="scroll-line" />
          EXPLORER AVYOR
        </a>
        <DemoCaption />
        <button
          className="video-control"
          onClick={toggle}
          aria-label={playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          <span>{playing ? 'Pause' : 'Lire'}</span>
        </button>
      </div>
    </section>
  );
}
