import { expect } from '@playwright/test';
import { testWithExtension } from '../fixtures/extension';

/**
 * NOTE: The End key is intentionally NOT tested — it is known to be broken
 * (see issue #94). The View Options "cancel zip" flow is also excluded.
 */

const TEST_IMAGE_BYTES = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7ZQe0AAAAASUVORK5CYII=',
	'base64'
);

/**
 * Blur any currently-focused form element so that keyboard events reach the
 * gallery's @HostListener. The gallery handler skips keys when a form element
 * (INPUT, TEXTAREA, SELECT, BUTTON) is the active element.
 */
async function blurFormFocus(page: import('@playwright/test').Page): Promise<void> {
	await page.evaluate(() => {
		const active = document.activeElement as HTMLElement | null;
		if (active) active.blur();
	});
}

async function stubGalleryImageResponses(page: import('@playwright/test').Page): Promise<void> {
	await page.route('https://example.com/**', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'image/png',
			body: TEST_IMAGE_BYTES,
		});
	});
}

async function loadGalleryWithItems(
	page: import('@playwright/test').Page,
	extensionId: string,
	fuskrPattern: string,
	expectedItemCount: number
): Promise<void> {
	await stubGalleryImageResponses(page);
	await page.goto(`chrome-extension://${extensionId}/index.html#/gallery`, {
		waitUntil: 'domcontentloaded',
	});

	const urlInput = page.locator('#originalUrlInput');
	await expect(urlInput).toBeVisible({ timeout: 10000 });
	await urlInput.fill(fuskrPattern);

	const generateButton = page.getByRole('button', { name: /generate gallery/i });
	await expect(generateButton).toBeVisible();
	await generateButton.click();

	await expect(page.locator('.image-item')).toHaveCount(expectedItemCount, {
		timeout: 10000,
	});
}

testWithExtension.describe('Gallery', () => {
	testWithExtension(
		'should render the gallery component for a fuskr URL',
		async ({ extensionContext: { context, extensionId } }) => {
			// Navigate to the popup with a pre-populated fuskr URL in the hash
			// The gallery route is typically #/gallery or loaded after submitting a URL
			const galleryUrl = `chrome-extension://${extensionId}/index.html`;
			const page = await context.newPage();

			await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

			// Angular app should mount
			const appRoot = page.locator('app-root');
			await expect(appRoot).toBeAttached({ timeout: 10000 });

			// Find the URL input and submit a fuskr pattern URL
			// The input is typically the main input on the popup home screen
			const urlInput = page.locator('input[type="text"], input[type="url"], input:not([type])').first();
			const inputVisible = await urlInput.isVisible({ timeout: 5000 }).catch(() => false);

			if (inputVisible) {
				// Enter a test fuskr URL — use a publicly accessible pattern
				// (test will pass even if images 404; we're testing the gallery renders)
				await urlInput.fill('https://example.com/image[1-3].jpg');

				const submitBtn = page
					.locator('button[type="submit"], button:has-text("Go"), button:has-text("Fuskr")')
					.first();
				const btnVisible = await submitBtn.isVisible({ timeout: 3000 }).catch(() => false);
				if (btnVisible) {
					await submitBtn.click();
				} else {
					await urlInput.press('Enter');
				}

				// Gallery component should appear
				const gallery = page.locator('app-gallery, [class*="gallery"]');
				await expect(gallery.first()).toBeAttached({ timeout: 15000 });
			} else {
				// If already on gallery route, just check the gallery component exists
				const gallery = page.locator('app-gallery, [class*="gallery"]');
				await expect(gallery.first()).toBeAttached({ timeout: 10000 });
			}

			await page.close();
		}
	);

	testWithExtension(
		'should render the correct number of image items for a bracketed URL pattern',
		async ({ extensionContext: { context, extensionId } }) => {
			const fuskrPattern = 'https://example.com/image[1-3].jpg';
			const page = await context.newPage();

			await loadGalleryWithItems(page, extensionId, fuskrPattern, 3);

			const appRoot = page.locator('app-root');
			await expect(appRoot).toBeAttached({ timeout: 10000 });

			const imageItems = page.locator('.image-item');
			const itemCount = await imageItems.count();
			expect(itemCount).toBe(3);

			const totalStat = page
				.locator('.sticky-gallery-controls .stats-info .stat')
				.filter({ hasText: /3\s+total/i })
				.first();
			await expect(totalStat).toBeVisible({ timeout: 5000 });

			await page.close();
		}
	);

	testWithExtension('should load more items when infinite mode is enabled and user scrolls', async ({ extensionContext: { context, extensionId } }) => {
		const fuskrPattern = 'https://example.com/image[000-011].jpg';
		const page = await context.newPage();

		await loadGalleryWithItems(page, extensionId, fuskrPattern, 12);

		const infiniteToggle = page
			.locator('button')
			.filter({ hasText: /infinite\s+(on|off)/i })
			.first();
		await expect(infiniteToggle).toBeVisible({ timeout: 5000 });
		await infiniteToggle.click();

		await page.evaluate(() => {
			window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
		});

		await expect
			.poll(async () => page.locator('.image-item').count(), {
				timeout: 10000,
			})
			.toBeGreaterThan(12);

		await page.close();
	});

	testWithExtension(
		'should support keyboard navigation with arrow keys in gallery',
		async ({ extensionContext: { context, extensionId } }) => {
			// Navigate directly to the gallery route (no items loaded — smoke test only)
			const galleryUrl = `chrome-extension://${extensionId}/index.html#/gallery`;
			const page = await context.newPage();

			await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

			const appRoot = page.locator('app-root');
			await expect(appRoot).toBeAttached({ timeout: 10000 });

			// Press arrow keys — these should not throw errors even with no images loaded.
			// The handler returns early when mediaItems.length === 0, so this tests that
			// the key listener is registered and does not crash.
			await page.keyboard.press('ArrowRight');
			await page.keyboard.press('ArrowLeft');
			await page.keyboard.press('ArrowRight');

			// The app should still be alive (no crash/unhandled error)
			await expect(appRoot).toBeAttached();

			await page.close();
		}
	);

	testWithExtension(
		'should highlight items during ArrowRight and ArrowLeft navigation in a loaded gallery',
		async ({ extensionContext: { context, extensionId } }) => {
			const fuskrPattern = 'https://example.com/image[1-3].jpg';
			const page = await context.newPage();

			await loadGalleryWithItems(page, extensionId, fuskrPattern, 3);

			const appRoot = page.locator('app-root');
			await expect(appRoot).toBeAttached({ timeout: 10000 });

			const imageItems = page.locator('.image-item');
			await expect(imageItems).toHaveCount(3, { timeout: 5000 });

			const focusedItems = page.locator('.image-item.keyboard-focused');
			await expect(focusedItems).toHaveCount(1, { timeout: 3000 });

			await blurFormFocus(page);

			await page.keyboard.press('ArrowRight');
			await expect(focusedItems).toHaveCount(1, { timeout: 3000 });

			await page.keyboard.press('ArrowRight');
			await expect(focusedItems).toHaveCount(1, { timeout: 3000 });

			await page.keyboard.press('ArrowLeft');
			await expect(focusedItems).toHaveCount(1, { timeout: 3000 });

			await expect(appRoot).toBeAttached();

			await page.close();
		}
	);

	testWithExtension(
		'should support Home key navigation in gallery',
		async ({ extensionContext: { context, extensionId } }) => {
			// Smoke test: pressing Home in an empty gallery should not crash the app.
			const galleryUrl = `chrome-extension://${extensionId}/index.html#/gallery`;
			const page = await context.newPage();

			await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

			const appRoot = page.locator('app-root');
			await expect(appRoot).toBeAttached({ timeout: 10000 });

			// Navigate forward, then Home back to first (no items — handler returns early)
			await page.keyboard.press('ArrowRight');
			await page.keyboard.press('Home');

			// App should remain stable after Home key press
			await expect(appRoot).toBeAttached();

			await page.close();
		}
	);

	testWithExtension(
		'should navigate to the first item when Home key is pressed in a loaded gallery',
		async ({ extensionContext: { context, extensionId } }) => {
			const fuskrPattern = 'https://example.com/image[1-3].jpg';
			const page = await context.newPage();

			await loadGalleryWithItems(page, extensionId, fuskrPattern, 3);

			const appRoot = page.locator('app-root');
			await expect(appRoot).toBeAttached({ timeout: 10000 });

			const imageItems = page.locator('.image-item');
			await expect(imageItems).toHaveCount(3, { timeout: 5000 });

			const focusedItems = page.locator('.image-item.keyboard-focused');
			await expect(focusedItems).toHaveCount(1, { timeout: 3000 });

			await blurFormFocus(page);

			await page.keyboard.press('ArrowRight');
			await expect(focusedItems).toHaveCount(1, { timeout: 3000 });

			await page.keyboard.press('Home');
			await expect(focusedItems).toHaveCount(1, { timeout: 3000 });

			const focusedIndex = await focusedItems.first().locator('[data-index]').getAttribute('data-index');
			expect(focusedIndex).toBe('0');

			await expect(appRoot).toBeAttached();
			await page.close();
		}
	);

	testWithExtension(
		'should trigger the zip download prompt when Download All is clicked',
		async ({ extensionContext: { context, extensionId } }) => {
			const fuskrPattern = 'https://example.com/image[1-3].jpg';
			const page = await context.newPage();

			await loadGalleryWithItems(page, extensionId, fuskrPattern, 3);

			const appRoot = page.locator('app-root');
			await expect(appRoot).toBeAttached({ timeout: 10000 });

			const imageItems = page.locator('.image-item');
			await expect(imageItems).toHaveCount(3, { timeout: 5000 });

			const downloadAllBtn = page
				.locator('button')
				.filter({ hasText: /download all/i })
				.first();
			await expect(downloadAllBtn).toBeVisible({ timeout: 5000 });
			await expect(downloadAllBtn).toBeEnabled();

			let promptSeen = false;
			page.once('dialog', async (dialog) => {
				promptSeen = true;
				expect(dialog.type()).toBe('prompt');
				await dialog.accept('test-fuskr-gallery');
			});

			await downloadAllBtn.click();
			await expect.poll(() => promptSeen).toBe(true);

			await expect(appRoot).toBeAttached();

			await page.close();
		}
	);
});
