import { defineConfig, devices } from '@playwright/test';

// End to end tests: a real browser drives the real frontend, which talks to the real API and
// databases. PostgreSQL and MongoDB must be running (docker compose up -d in the API repo) and
// the database must be migrated, seeded and have the catalogue imported.
//
// `npm run test:e2e` starts the frontend (Vite) and the API (tsx) itself when they are not
// running yet. Set E2E_BASE_URL to test an already deployed frontend instead.
const WEB_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';
const API_DIR = process.env.E2E_API_DIR ?? '../smart-reading-coach-api';
const startServers = !process.env.E2E_BASE_URL;

export default defineConfig({
    testDir: './e2e',
    outputDir: './test-results',
    // Tests register their own users, so they do not share state and can run side by side.
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
    timeout: 30_000,
    expect: { timeout: 10_000 },
    use: {
        baseURL: WEB_URL,
        locale: 'nl-NL',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
        // The same flows on a phone sized screen, because the app must be fully usable there.
        { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /reading-flow\.spec\.ts/ },
    ],
    webServer: startServers
        ? [
              {
                  command: 'npm run dev -- --port 5173 --strictPort',
                  url: WEB_URL,
                  reuseExistingServer: true,
                  timeout: 60_000,
              },
              {
                  command: 'npm run dev',
                  cwd: API_DIR,
                  url: 'http://localhost:3000/api/health',
                  reuseExistingServer: true,
                  timeout: 60_000,
              },
          ]
        : undefined,
});
