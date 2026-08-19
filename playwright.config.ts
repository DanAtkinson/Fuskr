import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const bddTestDir = defineBddConfig({
	features: 'e2e/features/**/*.feature',
	steps: ['e2e/steps/**/*.ts', 'e2e/fixtures/bdd.ts'],
	outputDir: 'e2e/.features-gen',
});

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
			testDir: './e2e/tests',
			use: {
				...devices['Desktop Chrome'],
			},
		},
		{
			name: 'chromium-bdd',
			testDir: bddTestDir,
			use: {
				...devices['Desktop Chrome'],
			},
		},
		{
			name: 'firefox-bdd',
			testDir: bddTestDir,
			use: {
				...devices['Desktop Firefox'],
				browserName: 'firefox',
			},
		},
	],
	globalSetup: './e2e/global-setup.ts',
});
