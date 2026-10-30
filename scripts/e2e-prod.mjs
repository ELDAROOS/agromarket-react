import { spawnSync } from 'node:child_process';
const url = process.env.E2E_BASE_URL || 'https://agromarket-eldaroos.vercel.app';
const result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit', env: { ...process.env, E2E_BASE_URL: url },
});
process.exit(result.status ?? 1);
