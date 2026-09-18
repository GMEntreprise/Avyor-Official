import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, m } from 'motion/react';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { DownloadAppButton } from './DownloadAppButton';
import { StoreButtons } from './StoreButtons';
import { Device, DemoCaption } from './Device';
import { Title } from './Lines';
import { useHref, useUi } from '../content/context';
export function Hero() {
  const ui = useUi();
  const href = useHref();
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
            {ui.hero.eyebrow}
          </p>
          <h1>
            <Title headline={ui.hero.title} breakClass="desktop-break" />
          </h1>
          <p className="hero-description">
            {ui.hero.description[0]}
            <br />
            {ui.hero.description[1]}
          </p>
          <div className="hero-actions">
            <DownloadAppButton variant="hero" label={ui.download.app} />
            <a className="quiet-link" href={`${href('')}#experience`}>
              {ui.hero.seeHow} <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
          <StoreButtons />
        </div>
        <m.div className="hero-product" initial={false} animate={{ y: 0 }}>
          <div className="hero-orbit" />
          <div className="device-tag tag-top">
            <span>{ui.hero.tagTop}</span>
            <ArrowUpRight size={17} />
          </div>
          <Device scene="02-matching" className="hero-device-back" priority />
          <Device scene="04-feed" className="hero-device-front" priority />
          <div className="device-tag tag-bottom">
            <span className="tag-rule" />
            <span>{ui.hero.tagBottom}</span>
          </div>
        </m.div>
      </div>
      <div className="hero-bottom container">
        <a href={`${href('')}#experience`}>
          <span className="scroll-line" />
          {ui.hero.explore}
        </a>
        <DemoCaption />
        <button
          className="video-control"
          onClick={toggle}
          aria-label={playing ? ui.media.pauseVideo : ui.media.playVideo}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          <span>{playing ? ui.media.pause : ui.media.play}</span>
        </button>
      </div>
    </section>
  );
}
