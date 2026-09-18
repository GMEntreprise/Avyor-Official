import { spawn } from 'node:child_process';

/**
 * Build entry point for Vercel.
 *
 * The canonical URL is decided here rather than in a committed .env file, so a
 * deployment can never publish canonicals pointing at someone else's domain.
 * Order: an explicit VITE_SITE_URL wins; otherwise Vercel's own production URL
 * is used, which becomes the real domain by itself once one is attached.
 */
const explicit = process.env.VITE_SITE_URL?.trim();
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
const origin = explicit || (fromVercel ? `https://${fromVercel}` : '');

if (!origin) {
  console.error(
    'No canonical URL. Set VITE_SITE_URL in the Vercel project, or deploy from\n' +
      'Vercel so VERCEL_PROJECT_PRODUCTION_URL is provided.',
  );
  process.exit(1);
}

let hostname;
try {
  const url = new URL(origin);
  if (url.protocol !== 'https:') throw new Error('not https');
  hostname = url.hostname;
} catch {
  console.error(`VITE_SITE_URL must be an absolute https URL, received: ${origin}`);
  process.exit(1);
}

// A deployment URL must never be the one search engines are told to index:
// the real domain would then compete with a vercel.app copy of the same pages.
const indexable = process.env.VITE_SITE_INDEXABLE === 'true';
if (indexable && /(^|\.)vercel\.app$/.test(hostname)) {
  console.error(
    `Refusing to publish an indexable site on ${hostname}.\n` +
      'Attach the real domain first, then set VITE_SITE_INDEXABLE=true.',
  );
  process.exit(1);
}

console.log(`Canonical origin : ${origin}`);
console.log(`Indexable        : ${indexable ? 'yes' : 'no (pages carry noindex)'}`);

const build = spawn('bun', ['run', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_SITE_URL: origin },
});
build.on('exit', (code) => process.exit(code ?? 1));
build.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
