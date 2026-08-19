import { BrowserContext, Page } from '@playwright/test';
import { createBdd, test as base } from 'playwright-bdd';
import { launchExtensionContext } from './extension';
import { launchFirefoxExtensionContext } from './firefox-extension';

export const test = base.extend<{
	extensionContext: { context: BrowserContext; extensionId: string; extensionUrl: string };
	extensionPage: Page;
}>({
	// eslint-disable-next-line no-empty-pattern
	extensionContext: async ({}, use) => {
		const result = process.env['BDD_BROWSER'] === 'firefox'
			? await launchFirefoxExtensionContext()
			: await launchExtensionContext();
		const extensionContext = {
			...result,
			extensionUrl: result.extensionUrl ?? `chrome-extension://${result.extensionId}`,
		};
		await use(extensionContext);
		await extensionContext.context.close();
	},
	extensionPage: async ({ extensionContext }, use) => {
		const page = await extensionContext.context.newPage();
		await use(page);
		await page.close();
	},
});

export const { Given, When, Then, Before, After } = createBdd(test);
