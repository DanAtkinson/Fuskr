import { BrowserContext, firefox } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const FIREFOX_EXTENSION_PATH = path.resolve(__dirname, '..', '..', 'dist', 'firefox');
export const FIREFOX_EXTENSION_ID = '{6fbd1009-d97d-45b7-97d6-1b34d4182a0c}';

export async function launchFirefoxExtensionContext(): Promise<{
	context: BrowserContext;
	extensionId: string;
	extensionUrl: string;
}> {
	if (!fs.existsSync(path.join(FIREFOX_EXTENSION_PATH, 'manifest.json'))) {
		throw new Error(
			`Firefox extension not built. Expected dist at: ${FIREFOX_EXTENSION_PATH}. ` +
			`Run 'npm run build:extensions:prod' first.`,
		);
	}

	const profilePath = fs.mkdtempSync(path.join(os.tmpdir(), 'fuskr-firefox-'));
	const extensionPath = path.join(profilePath, 'extensions', FIREFOX_EXTENSION_ID);
	fs.mkdirSync(path.dirname(extensionPath), { recursive: true });
	fs.cpSync(FIREFOX_EXTENSION_PATH, extensionPath, { recursive: true });

	const context = await firefox.launchPersistentContext(profilePath, {
		headless: true,
		firefoxUserPrefs: {
			'extensions.autoDisableScopes': 0,
			'extensions.enabledScopes': 15,
			'xpinstall.signatures.required': false,
		},
	});

	const extensionId = FIREFOX_EXTENSION_ID.replace(/[{}]/g, '');

	return {
		context,
		extensionId,
		extensionUrl: `moz-extension://${extensionId}`,
	};
}