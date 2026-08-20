import { firefox } from '@playwright/test';
import type { BrowserContext } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';

export const FIREFOX_EXTENSION_PATH = path.resolve(__dirname, '..', '..', 'dist', 'firefox');
export const FIREFOX_EXTENSION_ID = '{6fbd1009-d97d-45b7-97d6-1b34d4182a0c}';

/**
 * Packs the extension directory into a .xpi (zip) file and places it in the
 * Firefox profile's extensions directory. Firefox loads packed .xpi files from
 * the profile on startup; it does NOT load unpacked directories from there.
 */
async function packExtensionAsXpi(extensionDir: string, destXpiPath: string): Promise<void> {
	const zip = new JSZip();
	const addDir = (dirPath: string, zipPath: string) => {
		for (const entry of fs.readdirSync(dirPath)) {
			const fullPath = path.join(dirPath, entry);
			const entryZipPath = zipPath ? `${zipPath}/${entry}` : entry;
			if (fs.statSync(fullPath).isDirectory()) {
				addDir(fullPath, entryZipPath);
			} else {
				zip.file(entryZipPath, fs.readFileSync(fullPath));
			}
		}
	};
	addDir(extensionDir, '');
	const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
	fs.writeFileSync(destXpiPath, content);
}

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
	const extensionsDir = path.join(profilePath, 'extensions');
	fs.mkdirSync(extensionsDir, { recursive: true });

	// Firefox loads packed .xpi files from the profile's extensions directory.
	// The file must be named <extensionId>.xpi so Firefox assigns the correct ID.
	const xpiPath = path.join(extensionsDir, `${FIREFOX_EXTENSION_ID}.xpi`);
	await packExtensionAsXpi(FIREFOX_EXTENSION_PATH, xpiPath);

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