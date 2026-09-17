import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { feature } from "topojson-client";

/* Régénère src/components/WorldPresenceSection/world-geo.ts depuis Natural Earth
   50m (world-atlas, domaine public, téléchargé à la volée). Simplification
   Douglas-Peucker PAR ANNEAU (epsilon en degrés) : les grandes côtes sont
   allégées, les petites îles sont préservées intactes.
   Usage : node scripts/gen-world-geo.mjs [epsilon]   (défaut 0.2) */

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/components/WorldPresenceSection/world-geo.ts");
const SRC = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
const EPS = Number(process.argv[2] ?? 0.2); // tolérance en degrés

const topo = await (await fetch(SRC)).json();
const fc = feature(topo, topo.objects.countries);

const perpDist = (p, a, b) => {
  const [x, y] = p,
    [x1, y1] = a,
    [x2, y2] = b;
  const dx = x2 - x1,
    dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(x - x1, y - y1);
  const t = ((x - x1) * dx + (y - y1) * dy) / len2;
  const px = x1 + t * dx,
    py = y1 + t * dy;
  return Math.hypot(x - px, y - py);
};
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let dmax = 0,
    idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > dmax) {
      dmax = d;
      idx = i;
    }
  }
  if (dmax > eps) {
    const left = rdp(pts.slice(0, idx + 1), eps);
    const right = rdp(pts.slice(idx), eps);
    return left.slice(0, -1).concat(right);
  }
  return [pts[0], pts[pts.length - 1]];
}

const round = (n, d) => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};
function ringSize(ring) {
  let minx = Infinity,
    miny = Infinity,
    maxx = -Infinity,
    maxy = -Infinity;
  for (const [x, y] of ring) {
    if (x < minx) minx = x;
    if (x > maxx) maxx = x;
    if (y < miny) miny = y;
    if (y > maxy) maxy = y;
  }
  return Math.max(maxx - minx, maxy - miny);
}
function simplifyRing(ring) {
  const size = ringSize(ring);
  // petites îles (< 2°) : pas de RDP, précision 3 décimales (préserve la forme)
  // grandes côtes : RDP (ε) + précision 2 décimales (allège le poids)
  const small = size < 2;
  const dec = small ? 3 : 2;
  const src = small ? ring : rdp(ring, EPS);
  const out = [];
  let px, py;
  for (const [x0, y0] of src) {
    const x = round(x0, dec),
      y = round(y0, dec);
    if (x !== px || y !== py) {
      out.push([x, y]);
      px = x;
      py = y;
    }
  }
  if (out.length && (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1]))
    out.push(out[0]);
  return out.length >= 4 ? out : null;
}
const geom = (g) => {
  if (g.type === "Polygon") {
    const rings = g.coordinates.map(simplifyRing).filter(Boolean);
    return rings.length ? { type: "Polygon", coordinates: rings } : null;
  }
  if (g.type === "MultiPolygon") {
    const polys = g.coordinates
      .map((p) => p.map(simplifyRing).filter(Boolean))
      .filter((p) => p.length);
    return polys.length ? { type: "MultiPolygon", coordinates: polys } : null;
  }
  return null;
};

const DROP = new Set(["010"]); // Antarctique
const feats = [];
for (const f of fc.features) {
  const id = String(f.id);
  if (DROP.has(id)) continue;
  const g = geom(f.geometry);
  if (g) feats.push({ id, name: (f.properties && f.properties.name) || "", geometry: g });
}

/* Territoires d'outre-mer français absents du jeu admin-0 (fusionnés dans la
   France métropolitaine). Polygones simplifiés mais reconnaissables, pour qu'ils
   soient dessinés, étiquetés et cliquables distinctement. ids ISO 3166-1 num. */
const box = (lng, lat, w, h) => ({
  type: "Polygon",
  coordinates: [
    [
      [lng - w, lat - h],
      [lng + w, lat - h],
      [lng + w * 1.1, lat],
      [lng + w, lat + h],
      [lng - w, lat + h],
      [lng - w * 1.1, lat],
      [lng - w, lat - h],
    ].map(([a, b]) => [Math.round(a * 100) / 100, Math.round(b * 100) / 100]),
  ],
});
const EXTRA = [
  { id: "638", name: "Réunion", geometry: box(55.53, -21.13, 0.28, 0.22) },
  { id: "474", name: "Martinique", geometry: box(-61.02, 14.64, 0.16, 0.2) },
  { id: "312", name: "Guadeloupe", geometry: box(-61.55, 16.22, 0.22, 0.24) },
  { id: "254", name: "French Guiana", geometry: box(-53.2, 3.95, 1.6, 1.7) },
];
for (const e of EXTRA) feats.push(e);

const header = `/* =============================================================================
   Géométrie du monde — Natural Earth 50m (DOMAINE PUBLIC, via world-atlas),
   simplifiée par anneau (Douglas-Peucker, ε=${EPS}°) et compactée (2 décimales).
   Les grandes côtes sont allégées, les petites îles préservées. Indexée par code
   ISO 3166-1 NUMÉRIQUE (id). Projetée à l'exécution via d3-geo (cf. mapGeo.ts).
   Régénérée par scripts/gen-world-geo.mjs. NE PAS éditer à la main.
   ============================================================================= */
export type GeoGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };
export interface GeoFeature { id: string; name?: string; geometry: GeoGeometry; }
`;
const out = header + "export const WORLD_FEATURES: GeoFeature[] = " + JSON.stringify(feats) + ";\n";
writeFileSync(OUT, out);

const names = new Set(feats.map((f) => f.name));
const check = [
  "Mauritius",
  "Malta",
  "Comoros",
  "Cabo Verde",
  "Seychelles",
  "Maldives",
  "Singapore",
  "Monaco",
  "Barbados",
  "Tonga",
  "Chile",
  "Turkey",
  "France",
  "Japan",
];
console.log(
  "eps:",
  EPS,
  "| features:",
  feats.length,
  "| taille:",
  Math.round(out.length / 1024) + "KB",
);
console.log("presents:", check.map((n) => n + (names.has(n) ? "+" : "-")).join("  "));
