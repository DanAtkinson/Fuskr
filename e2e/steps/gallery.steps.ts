import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures/bdd';

Given('the Fuskr extension is open', async ({ extensionContext, extensionPage }) => {
	await extensionPage.goto(`${extensionContext.extensionUrl}/index.html#/gallery`, {
		waitUntil: 'domcontentloaded',
	});
	await expect(extensionPage.locator('#originalUrlInput')).toBeVisible({ timeout: 10000 });
});

When('I generate a gallery for {string}', async ({ extensionPage }, url: string) => {
	await extensionPage.locator('#originalUrlInput').fill(url);
	await extensionPage.getByRole('button', { name: /generate gallery/i }).click();
});

Then('I should see {int} gallery items', async ({ extensionPage }, expectedCount: number) => {
	await expect(extensionPage.locator('.image-item')).toHaveCount(expectedCount, {
		timeout: 15000,
	});
});

Given('the Fuskr options page is open', async ({ extensionContext, extensionPage }) => {
	await extensionPage.goto(`${extensionContext.extensionUrl}/index.html#/options`, {
		waitUntil: 'domcontentloaded',
	});
	await expect(extensionPage.locator('#darkMode')).toBeVisible({ timeout: 10000 });
});

When('I enable the dark mode setting', async ({ extensionPage }) => {
	const setting = extensionPage.locator('#darkMode');
	if (!(await setting.isChecked())) {
		await setting.check();
	}
});

Then('the dark mode setting should be enabled', async ({ extensionPage }) => {
	await expect(extensionPage.locator('#darkMode')).toBeChecked();
});
