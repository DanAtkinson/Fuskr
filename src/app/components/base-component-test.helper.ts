import { TestBed } from '@angular/core/testing';
import { ChromeService } from '@services/chrome.service';
import type { Mocked } from 'vitest';

/**
 * Base test setup for components that extend BaseComponent
 */
export class BaseComponentTestHelper {
	static setupChromeServiceMock(): Mocked<ChromeService> {
		const chromeServiceSpy = {
			getStorageData: vi.fn(),
			setStorageData: vi.fn(),
			getMessage: vi.fn(),
			isExtensionContext: vi.fn(),
			openTab: vi.fn(),
			downloadFile: vi.fn(),
		} as unknown as Mocked<ChromeService>;

		// Setup getMessage mock to return translated text
		chromeServiceSpy.getMessage.mockImplementation((key: string, substitutions?: string[]) => {
			const translations: Record<string, string> = {
				Options_Title: 'Fuskr Options',
				Options_Appearance: 'Appearance',
				Options_ImageDisplay: 'Image Display',
				Options_Behaviour: 'Behaviour',
				Options_DarkMode: 'Show Fuskr with a dark background',
				Options_DarkMode_Description: 'Changes the background of image sets to a darker colour. Will take effect once you refresh pages.',
				Options_DefaultImageDisplayMode: 'Default Image Display Mode:',
				Options_DisplayModeDescription: 'Choose how images are displayed by default in the gallery',
				Options_ResizeImagesFitOnPage: 'Resize images to fit on page',
				Options_ResizeImagesFullWidth: 'Resize images to full width',
				Options_ResizeImagesFillPage: 'Resize images to fill the page',
				Options_ResizeImagesThumbnails: 'Resize images to thumbnails',
				Options_ShowImagesInViewerDefault: 'Show images in viewer by default',
				Options_ShowImagesInViewerDescription: 'Open images in a full-screen viewer when clicked',
				Options_ShowBrokenImagesDefault: 'Show broken images by default',
				Options_ShowBrokenImagesDescription: 'Display placeholder images for missing/broken images',
				Options_OpenNewFusksInForeground: 'Open new fusks in the foreground',
				Options_OpenNewFusksInForeground_Description: 'When you create a new gallery, you may not wish to open it in the foreground. By unchecking this option, any new gallery will appear in the background instead.',
				Options_History_Keep: 'Keep a recent history of fusks',
				Options_History_Keep_Description: 'Every time you create a new gallery, the extension records the created url (up to the last 10). Clicking on the url will re-generate that gallery.',
				Options_SettingsSaved: 'Options saved!',
				Options_ErrorSaving: 'Error saving options',
				Gallery_Title: 'Fuskr Gallery',
				Gallery_SkipToGallery: 'Skip to gallery',
				Gallery_CopiedUrl: 'URL copied to clipboard',
				Gallery_CopiedAllUrls: 'Copied $1 URLs to clipboard',
				Gallery_CopyFailed: 'Failed to copy to clipboard',
				Gallery_SwitchToLightMode: 'Switch to Light Mode',
				Gallery_SwitchToDarkMode: 'Switch to Dark Mode',
				Gallery_GenerateGallery: 'Generate Gallery',
				Gallery_DisplayMode: 'Display Mode',
				Gallery_FitPage: 'Fit on page',
				Gallery_FullWidth: 'Full width',
				Gallery_FillPage: 'Fill page',
				Gallery_Thumbnails: 'Thumbnails',
				Gallery_ShowBroken: 'Show broken images',
				Gallery_HideBroken: 'Hide broken images',
				Gallery_ImageAlt: 'Image',
				Gallery_ErrorValidUrl: 'Please enter a valid URL',
				Gallery_ErrorNoPattern: 'No fuskable pattern found in the URL. Try a URL with numbers in the filename.',
				Gallery_ErrorGenerating: 'Error generating gallery:',
				Application_Prompt_NotAValidFusk: 'This is not a valid fusk - https://example.com/[1-8].jpg',
				Application_Prompt_NotAValidNumber: 'This is not a valid number.',
				Gallery_DownloadPreparing: 'Preparing download...',
				Gallery_DownloadNoImages: 'No images to download',
				Gallery_DownloadingItem: 'Downloading $1 ($2 of $3)...',
				Gallery_DownloadAddingMetadata: 'Adding metadata...',
				Gallery_DownloadCreatingZip: 'Creating ZIP file...',
				Gallery_DownloadSaving: 'Saving ZIP file...',
				Gallery_DownloadComplete: 'Download complete!',
				Gallery_DownloadFailed: 'Download failed',
				Gallery_ImageNotFound: 'Image not found',
				Gallery_ViewHistory: 'View Gallery History',
				Gallery_DownloadInProgress_ConfirmLeave: 'A download is in progress. Navigating away will cancel it. Are you sure?',
				History_Title: 'Gallery History',
				History_NewGallery: 'New Gallery',
				History_ClearAll: 'Clear All',
				History_OpenInNewTab: 'Open in New Tab',
				History_RemoveEntry: 'Remove from History',
				History_TotalImages: 'Total Images',
				History_LoadedImages: 'Loaded Successfully',
				History_BrokenImages: 'Failed to Load',
				History_SuccessRate: 'Success Rate',
				History_DisplayMode: 'Display Mode',
			};
			let msg = translations[key] || key;
			if (substitutions) {
				substitutions.forEach((val, i) => {
					msg = msg.replace(new RegExp(`\\$${i + 1}`, 'g'), val);
				});
			}
			return msg;
		});

		// Setup other method defaults
		chromeServiceSpy.getStorageData.mockResolvedValue({});
		chromeServiceSpy.setStorageData.mockResolvedValue();
		chromeServiceSpy.isExtensionContext.mockReturnValue(false);

		return chromeServiceSpy;
	}

	static configureMockChromeService(): void {
		const spy = this.setupChromeServiceMock();
		TestBed.configureTestingModule({
			providers: [{ provide: ChromeService, useValue: spy }],
		});
	}
}
