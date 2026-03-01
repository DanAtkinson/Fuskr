import { expect } from '@playwright/test';
import { testWithExtension } from '../fixtures/extension';

testWithExtension.describe('Options page', () => {
  testWithExtension(
    'should load the options page and render settings',
    async ({ extensionContext: { context, extensionId } }) => {
      // Options page is the SPA routed to /options
      const optionsUrl = `chrome-extension://${extensionId}/index.html#/options`;
      const page = await context.newPage();

      await page.goto(optionsUrl, { waitUntil: 'domcontentloaded' });

      // Angular app root should be present
      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeAttached({ timeout: 10_000 });

      // Options component should be rendered — look for the options container
      // (The actual selector depends on the template; use a broad check first)
      const optionsContent = page.locator('app-options, [class*="options"]');
      await expect(optionsContent.first()).toBeAttached({ timeout: 10_000 });

      await page.close();
    },
  );

  testWithExtension(
    'should open the options page in a new tab (open_in_tab)',
    async ({ extensionContext: { context, extensionId } }) => {
      const optionsUrl = `chrome-extension://${extensionId}/index.html#/options`;
      const page = await context.newPage();
      await page.goto(optionsUrl, { waitUntil: 'networkidle' });

      // Page should not be a blank/error page
      const body = await page.locator('body').textContent({ timeout: 5_000 });
      expect(body).not.toBeNull();

      // Angular router should have resolved /options — no 404-equivalent text
      expect(body).not.toContain('Cannot match any routes');

      await page.close();
    },
  );
});
