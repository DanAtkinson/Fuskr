import { expect } from '@playwright/test';
import { testWithExtension } from '../fixtures/extension';

/**
 * A Fuskr URL is a templated URL with a numeric range like {1-10}.
 * When resolved, Fuskr generates individual image URLs and shows a gallery.
 *
 * For e2e tests we load the gallery route directly within the extension popup.
 */
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
        await urlInput.fill('https://example.com/image{1-3}.jpg');

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
    'should support keyboard navigation with arrow keys in gallery',
    async ({ extensionContext: { context, extensionId } }) => {
      // Navigate directly to the gallery route
      const galleryUrl = `chrome-extension://${extensionId}/index.html#/gallery`;
      const page = await context.newPage();

      await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Focus the page and press arrow keys — these should not throw errors
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');

      // The app should still be alive (no crash/unhandled error)
      await expect(appRoot).toBeAttached();

      await page.close();
    },
  );

  testWithExtension(
    'should support Home key navigation in gallery',
    async ({ extensionContext: { context, extensionId } }) => {
      const galleryUrl = `chrome-extension://${extensionId}/index.html#/gallery`;
      const page = await context.newPage();

      await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });

      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Navigate forward, then Home back to first
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Home');

      // App should remain stable after Home key press
      await expect(appRoot).toBeAttached();

      await page.close();
    },
  );
});
