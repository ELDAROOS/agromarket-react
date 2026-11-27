import { defineConfig, devices } from '@playwright/test';
import { loadEnv } from 'vite';
import { randomBytes } from 'node:crypto';

const env = loadEnv('e2e', process.cwd(), 'E2E_');
for (const [key, value] of Object.entries(env)) process.env[key] ??= value;
const isRemote = Boolean(process.env.BASE_URL);
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5174';
if (!isRemote) {
  process.env.E2E_FARMER_EMAIL ||= 'e2e-admin@test.kz';
  process.env.E2E_FARMER_PASSWORD ||= randomBytes(24).toString('hex');
}

export default defineConfig({
  testDir: './e2e',
  timeout: isRemote ? 90_000 : 30_000,
  expect: { timeout: isRemote ? 60_000 : 5_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Любой BASE_URL разрешает только сценарии чтения, даже при запуске npm run e2e.
  grep: isRemote ? /@smoke/ : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    channel: process.env.E2E_BROWSER_CHANNEL || undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: isRemote ? undefined : [
    {
      command: 'node scripts/e2e-api.mjs',
      url: 'http://127.0.0.1:3100/api/health',
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174',
      url: baseURL,
      reuseExistingServer: false,
      env: { VITE_API_URL: 'http://127.0.0.1:3100/api' },
    },
  ],
});
