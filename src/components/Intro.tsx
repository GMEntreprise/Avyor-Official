/**
 * The AVYOR intro: the logo widens into an aperture that uncovers the hero.
 *
 * It is rendered by the server like the rest of the site, so it is already in
 * the delivered HTML and paints with the page — it never waits for the bundle.
 * That is what makes it play on a genuine first arrival, where it used to be
 * skipped because hydration had not happened yet.
 *
 * It therefore holds no state, no effect and no timer: rendering it on the
 * server and on the client must produce exactly the same markup. Everything
 * that varies is expressed in CSS, which the browser applies before paint:
 *   · the animation and its ending (`.intro`, `visibility: hidden` on the
 *     last frame, which doubles as the failsafe);
 *   · the reduced-motion case (`prefers-reduced-motion`);
 *   · the once-per-session rule (`.intro-seen`, set in <head> before paint).
 */
export function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <filter id="black-alpha">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
          </filter>
          <mask id="logo-reveal">
            <rect width="1000" height="1000" fill="white" />
            <image
              className="intro-aperture"
              href="/assets/brand/logo-mask.webp"
              x="350"
              y="350"
              width="300"
              height="300"
              filter="url(#black-alpha)"
            />
          </mask>
        </defs>
        <rect width="1000" height="1000" fill="#070b15" mask="url(#logo-reveal)" />
      </svg>
      <img className="intro-mark" src="/assets/brand/logo.webp" width="160" height="160" alt="" />
    </div>
  );
}
