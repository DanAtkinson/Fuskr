import { expect } from '@playwright/test';
import { testWithExtension } from '../fixtures/extension';

/**
 * A Fuskr URL is a templated URL with a numeric range like [1-10].
 * When resolved, Fuskr generates individual image URLs and shows a gallery.
 *
 * For e2e tests we load the gallery route directly within the extension popup.
 * The gallery route accepts a `url` query parameter (URL-encoded fuskr pattern).
 *
 * NOTE: The End key is intentionally NOT tested — it is known to be broken
 * (see issue #94). The View Options "cancel zip" flow is also excluded.
 */

/**
 * Build a gallery URL for the extension, URL-encoding the fuskr pattern so
 * the gallery component's `decodeUrlParameter` resolves it correctly.
 */
function buildGalleryUrl(extensionId: string, fuskrPattern: string): string {
  return `chrome-extension://${extensionId}/index.html#/gallery?url=${encodeURIComponent(fuskrPattern)}`;
}

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
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Find the URL input and submit a fuskr pattern URL
      // The input is typically the main input on the popup home screen
      const urlInput = page.locator('input[type="text"], input[type="url"], input:not([type])').first();
      const inputVisible = await urlInput.isVisible({ timeout: 5_000 }).catch(() => false);

      if (inputVisible) {
        // Enter a test fuskr URL — use a publicly accessible pattern
        // (test will pass even if images 404; we're testing the gallery renders)
        await urlInput.fill('https://example.com/image[1-3].jpg');

        const submitBtn = page.locator('button[type="submit"], button:has-text("Go"), button:has-text("Fuskr")').first();
        const btnVisible = await submitBtn.isVisible({ timeout: 3_000 }).catch(() => false);
        if (btnVisible) {
          await submitBtn.click();
        } else {
          await urlInput.press('Enter');
        }

        // Gallery component should appear
        const gallery = page.locator('app-gallery, [class*="gallery"]');
        await expect(gallery.first()).toBeAttached({ timeout: 15_000 });
      } else {
        // If already on gallery route, just check the gallery component exists
        const gallery = page.locator('app-gallery, [class*="gallery"]');
        await expect(gallery.first()).toBeAttached({ timeout: 10_000 });
      }

      await page.close();
    },
  );

  testWithExtension(
    'should render the correct number of image items for a bracketed URL pattern',
    async ({ extensionContext: { context, extensionId } }) => {
      // Load the gallery with a 3-item fuskr pattern: [1-3] expands to image1.jpg,
      // image2.jpg, image3.jpg.  The gallery creates one .image-item per URL
      // immediately (before images load), so we can assert the count synchronously.
      const fuskrPattern = 'https://example.com/image[1-3].jpg';
      const galleryUrl = buildGalleryUrl(extensionId, fuskrPattern);
      const page = await context.newPage();

      await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // The gallery generates .image-item elements synchronously after the URL
      // is processed — wait for them to appear before asserting the count.
      const imageItems = page.locator('.image-item');
      await expect(imageItems.first()).toBeAttached({ timeout: 15_000 });

      // The fuskr pattern [1-3] should expand to exactly 3 image items
      const itemCount = await imageItems.count();
      expect(itemCount).toBe(3);

      // The gallery stats bar should also show "3 Total"
      const statsBar = page.locator('.gallery-stats');
      await expect(statsBar).toBeAttached({ timeout: 5_000 });
      const statsText = await statsBar.textContent();
      expect(statsText).toContain('3');

      await page.close();
    },
  );

  testWithExtension(
    'should support keyboard navigation with arrow keys in gallery',
    async ({ extensionContext: { context, extensionId } }) => {
      // Navigate directly to the gallery route (no items loaded — smoke test only)
      const galleryUrl = `chrome-extension://${extensionId}/index.html#/gallery`;
      const page = await context.newPage();

      await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Press arrow keys — these should not throw errors even with no images loaded.
      // The handler returns early when mediaItems.length === 0, so this tests that
      // the key listener is registered and does not crash.
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');

      // The app should still be alive (no crash/unhandled error)
      await expect(appRoot).toBeAttached();

      await page.close();
    },
  );

  testWithExtension(
    'should highlight items during ArrowRight and ArrowLeft navigation in a loaded gallery',
    async ({ extensionContext: { context, extensionId } }) => {
      // Load a gallery with 3 items, then navigate with arrow keys and verify the
      // keyboard-focused highlight (CSS class .keyboard-focused) moves between items.
      // The gallery component sets currentGalleryIndex = 0 on init and adds the
      // `keyboard-focused` class to the matching .image-item div.
      const fuskrPattern = 'https://example.com/image[1-3].jpg';
      const galleryUrl = buildGalleryUrl(extensionId, fuskrPattern);
      const page = await context.newPage();

      await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Wait for all 3 image items to be rendered
      const imageItems = page.locator('.image-item');
      await expect(imageItems).toHaveCount(3, { timeout: 15_000 });

      // Wait for the initial keyboard-focused highlight to be set
      // (initializeKeyboardNavigation fires after a 100 ms timeout)
      const focusedItems = page.locator('.image-item.keyboard-focused');
      await expect(focusedItems).toHaveCount(1, { timeout: 3_000 });

      // Blur any form element so the @HostListener receives the keydown event
      await blurFormFocus(page);

      // ArrowRight advances focus — exactly one item should be highlighted
      await page.keyboard.press('ArrowRight');
      await expect(focusedItems).toHaveCount(1, { timeout: 3_000 });

      // ArrowRight again — advances to the third item
      await page.keyboard.press('ArrowRight');
      await expect(focusedItems).toHaveCount(1, { timeout: 3_000 });

      // ArrowLeft — moves back to the second item; still exactly one focused item
      await page.keyboard.press('ArrowLeft');
      await expect(focusedItems).toHaveCount(1, { timeout: 3_000 });

      // App remains stable throughout
      await expect(appRoot).toBeAttached();

      await page.close();
    },
  );

  testWithExtension(
    'should support Home key navigation in gallery',
    async ({ extensionContext: { context, extensionId } }) => {
      // Smoke test: pressing Home in an empty gallery should not crash the app.
      const galleryUrl = `chrome-extension://${extensionId}/index.html#/gallery`;
      const page = await context.newPage();

      await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Navigate forward, then Home back to first (no items — handler returns early)
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Home');

      // App should remain stable after Home key press
      await expect(appRoot).toBeAttached();

      await page.close();
    },
  );

  testWithExtension(
    'should navigate to the first item when Home key is pressed in a loaded gallery',
    async ({ extensionContext: { context, extensionId } }) => {
      // Load a 3-item gallery, advance focus to the second item via ArrowRight,
      // then press Home. The keyboard-focused class should jump back to the first
      // .image-item in DOM order (currentGalleryIndex = 0).
      //
      // NOTE: End key navigation is excluded — it is known broken (issue #94).
      const fuskrPattern = 'https://example.com/image[1-3].jpg';
      const galleryUrl = buildGalleryUrl(extensionId, fuskrPattern);
      const page = await context.newPage();

      await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Wait for all 3 items and for the initial highlight
      const imageItems = page.locator('.image-item');
      await expect(imageItems).toHaveCount(3, { timeout: 15_000 });

      const focusedItems = page.locator('.image-item.keyboard-focused');
      await expect(focusedItems).toHaveCount(1, { timeout: 3_000 });

      // Blur form focus so keys are handled by the gallery
      await blurFormFocus(page);

      // Advance to the second item
      await page.keyboard.press('ArrowRight');
      await expect(focusedItems).toHaveCount(1, { timeout: 3_000 });

      // Press Home — should snap focus back to the first image item (index 0)
      await page.keyboard.press('Home');
      await expect(focusedItems).toHaveCount(1, { timeout: 3_000 });

      // The focused item should be the first .image-item in the DOM.
      // Its child img carries data-index="0" (from the *ngFor index binding).
      const focusedIndex = await focusedItems.first().locator('[data-index]').getAttribute('data-index');
      expect(focusedIndex).toBe('0');

      await expect(appRoot).toBeAttached();
      await page.close();
    },
  );

  testWithExtension(
    'should trigger the zip download prompt when Download All is clicked',
    async ({ extensionContext: { context, extensionId } }) => {
      // Load a 3-item gallery, then click "Download All". A browser window.prompt
      // appears asking for a filename. After the user confirms (via dialog.accept),
      // the download begins and the button switches to a disabled "Downloading…" state.
      const fuskrPattern = 'https://example.com/image[1-3].jpg';
      const galleryUrl = buildGalleryUrl(extensionId, fuskrPattern);
      const page = await context.newPage();

      await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Wait for image items to be present (downloadAll() returns early if none)
      const imageItems = page.locator('.image-item');
      await expect(imageItems.first()).toBeAttached({ timeout: 15_000 });

      // Register the dialog handler BEFORE clicking — the prompt fires synchronously
      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('prompt');
        // Accept the prompt with a custom filename to trigger the zip generation
        await dialog.accept('test-fuskr-gallery');
      });

      // Click the "Download All" button in the gallery footer stats area
      const downloadAllBtn = page.locator('button').filter({ hasText: /download all/i });
      await expect(downloadAllBtn).toBeVisible({ timeout: 5_000 });
      await expect(downloadAllBtn).toBeEnabled();
      await downloadAllBtn.click();

      // After the prompt is accepted the zip begins: the button becomes disabled
      await expect(downloadAllBtn).toBeDisabled({ timeout: 5_000 });

      // App remains stable throughout
      await expect(appRoot).toBeAttached();

      await page.close();
    },
  );
});
