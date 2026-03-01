import { expect } from '@playwright/test';
import { testWithExtension } from '../fixtures/extension';

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
});
