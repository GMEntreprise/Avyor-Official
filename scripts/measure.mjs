import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
/*
 * Mesure de laboratoire, sur un appareil et un réseau simulés. Elle sert à
 * comparer deux versions du site, pas à décrire l'expérience réelle : seules
 * des mesures de terrain (Search Console, RUM) le font.
 *
 *   node scripts/measure.mjs [url] [fichier de sortie]
 */
const url = process.argv[2] || 'http://127.0.0.1:4173/';
const output = process.argv[3] || 'docs/site/lighthouse-mobile.json';
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless', '--no-first-run'],
});
try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    logLevel: 'error',
  });
  await writeFile(output, result.report);
  console.log(
    JSON.stringify(
      {
        url,
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([k, v]) => [k, v.score]),
        ),
        metrics: Object.fromEntries(
          [
            'largest-contentful-paint',
            'cumulative-layout-shift',
            'total-blocking-time',
            'first-contentful-paint',
          ].map((k) => [k, result.lhr.audits[k].displayValue]),
        ),
      },
      null,
      2,
    ),
  );
} finally {
  await chrome.kill();
}
