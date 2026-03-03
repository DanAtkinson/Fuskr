#!/usr/bin/env node

const fs = require('fs');
const { spawnSync } = require('child_process');

function resolveChromeBin() {
	if (process.env.CHROME_BIN) {
		return process.env.CHROME_BIN;
	}

	try {
		const { chromium } = require('@playwright/test');
		const executablePath = chromium.executablePath();

		if (executablePath && fs.existsSync(executablePath)) {
			process.env.CHROME_BIN = executablePath;
			console.log(`[karma] Using Playwright Chromium at ${executablePath}`);
			return executablePath;
		}
	} catch (error) {
		console.warn('[karma] Unable to resolve Playwright Chromium automatically.', error);
	}

	return '';
}

const chromeBin = resolveChromeBin();
if (!chromeBin) {
	console.error(
		'[karma] No Chrome binary available. Run "npm run install-browsers" or set CHROME_BIN explicitly.'
	);
	process.exit(1);
}

const ngCliBin = require.resolve('@angular/cli/bin/ng.js');
const ngArgs = ['test', ...process.argv.slice(2)];

const result = spawnSync(process.execPath, [ngCliBin, ...ngArgs], {
	env: process.env,
	stdio: 'inherit',
});

if (result.error) {
	console.error('[karma] Failed to start Angular CLI.', result.error);
	process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
