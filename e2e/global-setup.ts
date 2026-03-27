import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const DIST_PATH = path.resolve(__dirname, '..', 'dist', 'chromium');

export default async function globalSetup() {
	// Skip build if SKIP_BUILD env var is set (useful for local re-runs)
	if (process.env['SKIP_BUILD']) {
		console.log('[e2e] Skipping build (SKIP_BUILD is set)');
		return;
	}

	// Check if dist/chromium already exists with a recent manifest
	if (fs.existsSync(path.join(DIST_PATH, 'manifest.json'))) {
		console.log('[e2e] dist/chromium already exists, skipping build');
		return;
	}

	console.log('[e2e] Building Chromium extension...');
	execSync('npm run build:extensions:prod', {
		cwd: path.resolve(__dirname, '..'),
		stdio: 'inherit',
	});
	console.log('[e2e] Build complete');
}
