import { spawn } from 'node:child_process';

/**
 * Build entry point for Vercel.
 *
 * The canonical domain is declared here, in code, and a production build is
 * indexable because it is the real site. It used to depend on two environment
 * variables that nobody had set: the live site published
 * `canonical=avyor-official.vercel.app` and `noindex` on every page, so the
 * real domain was never going to be indexed and pointed at a copy of itself.
 *
 * Order: an explicit VITE_SITE_URL still wins — it is how a fork or a rehearsal
 * publishes under its own domain — then the declared domain.
 */
const PRODUCTION_ORIGIN = 'https://avyor.app';

const explicit = process.env.VITE_SITE_URL?.trim();
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
const origin = explicit || PRODUCTION_ORIGIN;

// Not an error: Vercel reports its own deployment domain until the custom one
// is the project's production domain. But a lasting divergence means the
// constant above is stale, and nothing else would ever say so.
if (fromVercel && !explicit && `https://${fromVercel}` !== PRODUCTION_ORIGIN)
  console.warn(
    `Note : Vercel annonce ${fromVercel}, le site publie ${PRODUCTION_ORIGIN}.\n` +
      '  Si le domaine a changé, mettez à jour PRODUCTION_ORIGIN et .env.production.',
  );

let hostname;
try {
  const url = new URL(origin);
  if (url.protocol !== 'https:') throw new Error('not https');
  hostname = url.hostname;
} catch {
  console.error(`VITE_SITE_URL must be an absolute https URL, received: ${origin}`);
  process.exit(1);
}

/*
 * Un build de production sur le vrai domaine est indexable : c'est le site.
 * La variable reste prioritaire quand elle est posée, pour une répétition ou
 * une mise en ligne différée.
 */
const production = process.env.VERCEL_ENV === 'production';
const declared = process.env.VITE_SITE_INDEXABLE?.trim();
const indexable = declared ? declared === 'true' : production && origin === PRODUCTION_ORIGIN;

// A deployment URL must never be the one search engines are told to index:
// the real domain would then compete with a vercel.app copy of the same pages.
if (indexable && /(^|\.)vercel\.app$/.test(hostname)) {
  console.error(
    `Refusing to publish an indexable site on ${hostname}.\n` +
      'Attach the real domain first, then set VITE_SITE_INDEXABLE=true.',
  );
  process.exit(1);
}

/**
 * Vercel Web Analytics and Speed Insights serve their scripts from paths only
 * Vercel answers, and only for the production deployment do their numbers mean
 * anything. Elsewhere they would be two 404s in every visitor's console.
 */
const insights = process.env.VERCEL_ENV === 'production';

console.log(`Canonical origin : ${origin}`);
console.log(`Indexable        : ${indexable ? 'yes' : 'no (pages carry noindex)'}`);
console.log(`Insights         : ${insights ? 'analytics and speed insights' : 'off'}`);

// `--dry-run` : montrer la décision sans construire. C'est ce que vérifient
// les tests, et ce qu'on lance pour comprendre un déploiement douteux.
if (process.argv.includes('--dry-run')) process.exit(0);

const build = spawn('bun', ['run', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_SITE_URL: origin,
    VITE_SITE_INDEXABLE: String(indexable),
    VITE_VERCEL_INSIGHTS: String(insights),
  },
});
build.on('exit', (code) => process.exit(code ?? 1));
build.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
