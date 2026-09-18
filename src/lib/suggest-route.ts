export interface RouteCandidate {
  slug: string;
  label: string;
}

/** Lowercase, accents removed, letters and digits only: « Sécurité » → « securite ». */
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

function distance(a: string, b: string): number {
  if (a === b) return 0;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++)
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    previous = current;
  }
  return previous[b.length];
}

/**
 * The page a visitor most likely meant, or null when nothing is close enough.
 *
 * Only the first segment of the path is compared, against both the slug and
 * the French label, so « /marques » and « /creatrs » both land somewhere.
 * A wrong suggestion is worse than none: the tolerance grows with the length
 * of the word, and very short or very long inputs are never guessed at.
 */
export function suggestRoute(path: string, routes: RouteCandidate[]): string | null {
  let segment: string;
  try {
    segment = decodeURIComponent(path.split('/').filter(Boolean)[0] ?? '');
  } catch {
    return null;
  }
  const wanted = normalize(segment);
  if (wanted.length < 3 || wanted.length > 40) return null;

  let best: { slug: string; score: number } | null = null;
  for (const route of routes)
    for (const name of [route.slug, route.label]) {
      const candidate = normalize(name);
      const score = distance(wanted, candidate);
      const tolerance = Math.max(1, Math.floor(candidate.length / 4));
      if (score <= tolerance && (!best || score < best.score)) best = { slug: route.slug, score };
    }
  return best?.slug ?? null;
}
