import { test as base, chromium, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export const EXTENSION_PATH = path.resolve(__dirname, '..', '..', 'dist', 'chromium');

/**
 * Launches a persistent Chromium context with the Fuskr extension loaded.
 * Detects the extension ID from the service worker URL.
 *
 * Notes:
 * - Chrome extensions require the new headless mode (`--headless=new`).
 *   The legacy headless mode doesn't support extensions.
 * - We resolve the extension ID by waiting for the MV3 service worker to
 *   register, then extracting the ID from its chrome-extension:// URL.
 * - The chrome://extensions/ page is NOT used as a fallback because it is
 *   blocked in headless Chrome (ERR_INVALID_URL).
 */
export async function launchExtensionContext(): Promise<{
  context: BrowserContext;
  extensionId: string;
}> {
  if (!fs.existsSync(EXTENSION_PATH)) {
    throw new Error(
      `Extension not built. Expected dist at: ${EXTENSION_PATH}. ` +
        `Run 'npm run build:extensions' first, or let globalSetup handle it.`,
    );
  }

  const context = await chromium.launchPersistentContext('', {
    // Use the new headless mode — legacy headless does not support extensions
    headless: false,
    args: [
      '--headless=new',
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  const extensionId = await resolveExtensionId(context);

  return { context, extensionId };
}

/**
 * Waits for the extension's MV3 service worker to register and extracts
 * the extension ID from its chrome-extension:// URL.
 *
 * Tries existing service workers first (already registered before we checked),
 * then waits for the serviceworker event with a generous timeout.
 * Polls with retries to handle slow startup in CI.
 */
async function resolveExtensionId(context: BrowserContext): Promise<string> {
  // Check already-registered service workers (race: may have registered before we attached)
  for (const worker of context.serviceWorkers()) {
    const id = extractExtensionId(worker.url());
    if (id) return id;
  }

  // Wait for the serviceworker event
  try {
    const worker = await context.waitForEvent('serviceworker', { timeout: 15_000 });
    const id = extractExtensionId(worker.url());
    if (id) return id;
  } catch {
    // Timeout — fall through to polling
  }

  // Poll as a last resort (handles cases where the event fired before we listened)
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500));
    for (const worker of context.serviceWorkers()) {
      const id = extractExtensionId(worker.url());
      if (id) return id;
    }
  }

  throw new Error(
    'Could not detect Fuskr extension ID after 20s. ' +
      'Is the extension built correctly? ' +
      `Expected service worker at: ${EXTENSION_PATH}/js/background.js`,
  );
}

function extractExtensionId(url: string): string {
  const match = url.match(/chrome-extension:\/\/([a-z]{32})\//);
  return match ? match[1] : '';
}

/**
 * A combined fixture that yields both context and extensionId together
 * (avoids launching two browser contexts per test).
 */
export const testWithExtension = base.extend<{
  extensionContext: { context: BrowserContext; extensionId: string };
}>({
  // eslint-disable-next-line no-empty-pattern
  extensionContext: async ({}, use) => {
    const result = await launchExtensionContext();
    await use(result);
    await result.context.close();
  },
});

export { expect } from '@playwright/test';
