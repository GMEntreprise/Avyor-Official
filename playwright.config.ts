import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'bun run preview',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: true,
    },
    {
      // Le site de test News, construit par scripts/news-fixture-site.mjs.
      command:
        'SERVE_DIR=.news-fixture/site REDIRECTS_FILE=.news-fixture/vercel.json PORT=4175 node scripts/serve.mjs',
      url: 'http://127.0.0.1:4175',
      reuseExistingServer: true,
    },
    {
      // L'admin News, sur un bac à sable jetable : jamais le vrai contenu.
      command: 'NEWS_ROOT=.news-e2e bunx vite --host 127.0.0.1 --port 5181 --strictPort',
      url: 'http://127.0.0.1:5181/admin/',
      reuseExistingServer: true,
    },
  ],
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        defaultBrowserType: 'chromium',
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
