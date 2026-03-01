import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 60_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: true,
  },
  projects: [
    {
      name: 'chromium-extension',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  globalSetup: './e2e/global-setup.ts',
});
