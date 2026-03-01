import { test as base, chromium, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export const EXTENSION_PATH = path.resolve(__dirname, '..', '..', 'dist', 'chromium');

/**
 * Launches a persistent Chromium context with the Fuskr extension loaded.
 * Detects the extension ID from the service worker URL.
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
    headless: true,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  // Wait for the service worker to register and extract the extension ID
  let extensionId = '';

  // Try service workers first (MV3)
  const serviceWorkerPromise = context
    .waitForEvent('serviceworker', { timeout: 10_000 })
    .then((worker) => {
      const url = worker.url();
      const match = url.match(/chrome-extension:\/\/([a-z]{32})\//);
      return match ? match[1] : '';
    })
    .catch(() => '');

  // Also check any already-registered service workers
  const existingWorkers = context.serviceWorkers();
  if (existingWorkers.length > 0) {
    const url = existingWorkers[0].url();
    const match = url.match(/chrome-extension:\/\/([a-z]{32})\//);
    if (match) {
      extensionId = match[1];
    }
  }

  if (!extensionId) {
    extensionId = await serviceWorkerPromise;
  }

  if (!extensionId) {
    // Fallback: open chrome://extensions and scrape the ID
    const page = await context.newPage();
    await page.goto('chrome://extensions/');
    // Give extensions a moment to load
    await page.waitForTimeout(1000);
    // Try to find extension ID from the page
    const workers = context.serviceWorkers();
    if (workers.length > 0) {
      const url = workers[0].url();
      const match = url.match(/chrome-extension:\/\/([a-z]{32})\//);
      if (match) extensionId = match[1];
    }
    await page.close();
  }

  if (!extensionId) {
    throw new Error('Could not detect Fuskr extension ID. Is the extension built correctly?');
  }

  return { context, extensionId };
}

/** Base fixture that provides a context + extensionId for each test. */
export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const { context } = await launchExtensionContext();
    await use(context);
    await context.close();
  },
  extensionId: async ({ context: _ }, use) => {
    // extensionId is resolved together with context — re-launch to get both cleanly
    const { context, extensionId } = await launchExtensionContext();
    await use(extensionId);
    await context.close();
  },
});

/**
 * A combined fixture that yields both context and extensionId together
 * (avoids launching two browser contexts per test).
 */
export const testWithExtension = base.extend<{
  extensionContext: { context: BrowserContext; extensionId: string };
}>({
  extensionContext: async ({}, use) => {
    const result = await launchExtensionContext();
    await use(result);
    await result.context.close();
  },
});

export { expect } from '@playwright/test';
