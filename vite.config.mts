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
			enabled: false,
			provider: 'v8',
			reportsDirectory: 'coverage/fuskr',
			reporter: ['html', 'text-summary', 'lcovonly'],
		},
	},
	define: {
		'import.meta.vitest': mode !== 'production',
	},
}));
