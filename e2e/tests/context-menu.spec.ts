import { expect } from '@playwright/test';
import { testWithExtension } from '../fixtures/extension';

/**
 * Context menu tests.
 *
 * Note: Playwright cannot directly trigger or inspect Chrome's native context menu
 * (it's a browser-native OS-level menu). Instead, we verify the extension's
 * context menu setup by checking that:
 * 1. The background service worker is registered (which creates the context menu)
 * 2. The extension loads without errors that would prevent context menus working
 *
 * True context menu interaction testing would require a dedicated extension test
 * helper or puppeteer-in-extension approach — left for a future iteration.
 */
testWithExtension.describe('Context menu', () => {
	testWithExtension(
		'should have the background service worker active (context menu registration)',
		async ({ extensionContext: { context, extensionId } }) => {
			// The context menu is registered in the service worker (background.ts)
			// Verify the service worker is active — a prerequisite for context menus
			const workers = context.serviceWorkers();
			expect(workers.length).toBeGreaterThan(0);

			const workerUrl = workers[0].url();
			expect(workerUrl).toContain(`chrome-extension://${extensionId}`);
			expect(workerUrl).toContain('background.js');
		}
	);

	testWithExtension(
		'should load extension on a page with images (context menu precondition)',
		async ({ extensionContext: { context, extensionId } }) => {
			// Navigate to a page with an image — this is the precondition for the
			// context menu on-image entries to appear
			const page = await context.newPage();

			// Use a simple data URL page with an image
			await page.setContent(`
        <html>
          <body>
            <img id="test-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="100" height="100" />
            <p>Right-click the image to see the Fuskr context menu</p>
          </body>
        </html>
      `);

			// Extension should be loaded — verify popup URL is reachable
			const img = page.locator('#test-img');
			await expect(img).toBeVisible();

			// Extension ID should be known (extension is loaded correctly)
			expect(extensionId).toMatch(/^[a-z]{32}$/);

			await page.close();
		}
	);
});
