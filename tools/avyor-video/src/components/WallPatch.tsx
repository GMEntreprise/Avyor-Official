import { OffthreadVideo, staticFile } from 'remotion';
import type { Quad } from '../lib/screen-transform';

/**
 * Softens the band of the studio wall where the generation printed a wordmark
 * whose letters mutate from frame to frame — « AVY », a broken V, « A YOR ».
 *
 * A second, blurred pass of the same plate is revealed only over that band, so
 * the wall keeps its own colour, glow and motion and simply stops resolving
 * letterforms there. The symbol above is untouched: it is stable and correct.
 * `backdrop-filter` would have been shorter, but it does not survive the
 * transform on the parent, and a flat painted patch would read as a smudge.
 */
export function WallPatch({
  src, trimBefore, corners, band, width, height,
}: {
  src: string; trimBefore: number; corners: Quad;
  band: readonly [number, number]; width: number; height: number;
}) {
  const [tl, tr, br, bl] = corners;
  const along = (a: readonly [number, number], b: readonly [number, number], t: number) =>
    [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as const;
  const points = [
    along(tl, bl, band[0]), along(tr, br, band[0]),
    along(tr, br, band[1]), along(tl, bl, band[1]),
  ];
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  // Generous radii: the reveal is feathered, so it must start well outside the text.
  const rx = (Math.max(...xs) - Math.min(...xs)) * 0.82;
  const ry = (Math.max(...ys) - Math.min(...ys)) * 1.45;
  const mask = `radial-gradient(ellipse ${rx.toFixed(1)}px ${ry.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px, #000 38%, transparent 100%)`;
  return (
    <div
      style={{
        position: 'absolute', left: 0, top: 0, width, height,
        pointerEvents: 'none', maskImage: mask, WebkitMaskImage: mask,
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        trimBefore={trimBefore}
        muted
        style={{ width, height, objectFit: 'fill', filter: 'blur(11px)', transform: 'scale(1.05)' }}
      />
    </div>
  );
}
