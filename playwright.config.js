import { defineConfig, devices } from '@playwright/test';
const remote = process.env.E2E_BASE_URL;
export default defineConfig({
  testDir: './e2e', timeout: 90_000, expect: { timeout: 15_000 },
  fullyParallel: false, workers: 1, retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: remote || 'http://localhost:5173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: remote ? undefined : {
    command: 'npm run dev -- --host 127.0.0.1', url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI, timeout: 30_000,
  },
});
