import { useEffect, useState } from 'react';
import { m, useReducedMotion } from 'motion/react';
export function Intro() {
  const [show, setShow] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    // A late intro would cover content the visitor is already reading.
    // Skip it on slow startup instead of adding another wait after hydration.
    if (performance.now() > 500 || reduced) return;
    try {
      if (sessionStorage.getItem('avyor-intro')) return;
      sessionStorage.setItem('avyor-intro', '1');
    } catch {
      /* Storage can be unavailable; content remains accessible. */
    }
    setShow(true);
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, [reduced]);
  if (!show) return null;
  return (
    <m.div
      className="intro"
      aria-hidden="true"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: reduced ? 0.2 : 1.5, times: [0, 0.72, 1] }}
    >
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="black-alpha">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
          </filter>
          <mask id="logo-reveal">
            <rect width="1000" height="1000" fill="white" />
            <m.image
              href="/assets/brand/logo-mask.webp"
              x="350"
              y="350"
              width="300"
              height="300"
              filter="url(#black-alpha)"
              initial={{ scale: 1 }}
              animate={{ scale: reduced ? 1 : 16 }}
              style={{ transformOrigin: '500px 500px' }}
              transition={{ duration: 1.45, ease: [0.76, 0, 0.24, 1] }}
            />
          </mask>
        </defs>
        <rect width="1000" height="1000" fill="#070b15" mask="url(#logo-reveal)" />
      </svg>
      <m.img
        className="intro-mark"
        src="/assets/brand/logo.webp"
        width="160"
        height="160"
        alt=""
        animate={{ opacity: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      />
    </m.div>
  );
}
