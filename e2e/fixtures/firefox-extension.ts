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
	const extensionUrl = `moz-extension://${extensionId}`;

	await waitForFirefoxExtension(context, extensionUrl);

	return {
		context,
		extensionId,
		extensionUrl,
	};
}

/**
 * Waits until the Firefox extension is loaded and accessible.
 *
 * After launching a persistent Firefox context with a sideloaded extension,
 * Firefox needs a moment to register the extension from the profile directory.
 * Navigating too early results in NS_ERROR_NOT_AVAILABLE. This function polls
 * the extension manifest URL until it responds successfully or a timeout is reached.
 */
async function waitForFirefoxExtension(
	context: BrowserContext,
	extensionUrl: string,
	timeout = 30_000,
): Promise<void> {
	const manifestUrl = `${extensionUrl}/manifest.json`;
	const deadline = Date.now() + timeout;
	const page = await context.newPage();

	try {
		while (Date.now() < deadline) {
			const remaining = deadline - Date.now();
			if (remaining <= 0) break;
			try {
				const response = await page.goto(manifestUrl, {
					waitUntil: 'domcontentloaded',
					timeout: Math.min(5_000, remaining),
				});
				if (response && response.ok()) {
					return;
				}
			} catch {
				// NS_ERROR_NOT_AVAILABLE or similar — extension not ready yet
			}
			await new Promise((r) => setTimeout(r, 500));
		}
		throw new Error(
			`Firefox extension did not become available within ${timeout}ms. ` +
				`Extension URL: ${extensionUrl}`,
		);
	} finally {
		await page.close();
	}
}