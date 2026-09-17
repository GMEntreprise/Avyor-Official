import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless', '--no-first-run'],
});
try {
  const result = await lighthouse('http://127.0.0.1:4173/', {
    port: chrome.port,
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    logLevel: 'error',
  });
  await writeFile('docs/site/lighthouse-mobile.json', result.report);
  console.log(
    JSON.stringify(
      {
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
