/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
	plugins: [angular(), viteTsConfigPaths()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['src/test-setup.ts'],
		include: ['src/**/*.spec.ts'],
		reporters: ['default'],
		coverage: {
			enabled: true,
			provider: 'v8',
			reportsDirectory: 'coverage/fuskr',
			reporter: ['html', 'text-summary', 'lcovonly'],
			// Thresholds reflect current coverage as a regression guard.
			// ChromeService (~17% coverage) wraps browser extension APIs that
			// require heavy mocking; GalleryComponent has many untested paths.
			// These values should be ratcheted up as coverage improves.
			thresholds: {
				statements: 60,
				branches: 50,
				functions: 65,
				lines: 60,
			},
		},
	},
	define: {
		'import.meta.vitest': mode !== 'production',
	},
}));
