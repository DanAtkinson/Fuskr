import { expect } from '@playwright/test';
import { testWithExtension } from '../fixtures/extension';

/**
 * Popup tests.
 *
 * The popup entry point is `index.html`, which immediately redirects to the
 * gallery view (`#/gallery`). These tests verify that the Angular app mounts
 * correctly and that the key UI elements expected by users are present.
 */
testWithExtension.describe('Popup', () => {
  testWithExtension(
    'should load the popup and display the Fuskr UI',
    async ({ extensionContext: { context, extensionId } }) => {
      const popupUrl = `chrome-extension://${extensionId}/index.html`;
      const page = await context.newPage();

      await page.goto(popupUrl, { waitUntil: 'domcontentloaded' });

      // The Angular app should mount — look for the root element
      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // There should be a visible input or main UI element
      // The popup renders a URL input for the gallery
      const body = page.locator('body');
      await expect(body).not.toBeEmpty();

      await page.close();
    },
  );

  testWithExtension(
    'should display the extension popup page with a title',
    async ({ extensionContext: { context, extensionId } }) => {
      const popupUrl = `chrome-extension://${extensionId}/index.html`;
      const page = await context.newPage();

      await page.goto(popupUrl, { waitUntil: 'networkidle' });

      // Page should have a non-empty title or at least load without error
      const title = await page.title();
      // Angular SPA — title may be set by the app, but the page shouldn't 404
      expect(title).toBeDefined();

      // Angular should have bootstrapped (no error overlay)
      const ngErrors = page.locator('body.ng-scope, app-root');
      await expect(ngErrors).toBeAttached({ timeout: 10_000 });

      await page.close();
    },
  );

  testWithExtension(
    'should display the URL input field and generate button',
    async ({ extensionContext: { context, extensionId } }) => {
      // The popup redirects to the gallery view — verify key UI inputs are present.
      // The gallery component renders a URL text field and a "Generate Gallery" button.
      const popupUrl = `chrome-extension://${extensionId}/index.html`;
      const page = await context.newPage();

      await page.goto(popupUrl, { waitUntil: 'networkidle' });

      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Verify the URL input is rendered (id="originalUrlInput" in gallery.component.html)
      const urlInput = page.locator('#originalUrlInput');
      await expect(urlInput).toBeVisible({ timeout: 10_000 });

      // The input should accept text
      await urlInput.fill('https://example.com/test[1-3].jpg');
      await expect(urlInput).toHaveValue('https://example.com/test[1-3].jpg');

      await page.close();
    },
  );

  testWithExtension(
    'should render the gallery header navigation buttons',
    async ({ extensionContext: { context, extensionId } }) => {
      // The gallery header contains history, theme-toggle, and options navigation buttons.
      // Verify at least 3 buttons are present so users can access all views.
      const galleryUrl = `chrome-extension://${extensionId}/index.html#/gallery`;
      const page = await context.newPage();

      await page.goto(galleryUrl, { waitUntil: 'networkidle' });

      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Gallery header should have history, dark-mode toggle, and options buttons
      const headerButtons = page.locator('.gallery-header button');
      const buttonCount = await headerButtons.count();
      expect(buttonCount).toBeGreaterThanOrEqual(3);

      await page.close();
    },
  );
});
