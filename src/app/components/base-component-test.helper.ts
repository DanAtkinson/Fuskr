import { TestBed } from '@angular/core/testing';
import { IChromeStorageData } from '@interfaces/chrome-storage';
import { ChromeService } from '@services/chrome.service';
import { vi, type Mocked } from 'vitest';

/**
 * Base test setup for components that extend BaseComponent
 */
export class BaseComponentTestHelper {
	static setupChromeServiceMock(): Mocked<ChromeService> {
		const chromeServiceSpy = {
			getStorageData: vi.fn(),
			setStorageData: vi.fn(),
			updateDisplaySettings: vi.fn(),
			getMessage: vi.fn(),
			isExtensionContext: vi.fn(),
			openTab: vi.fn(),
			downloadFile: vi.fn(),
			hasLoggingPermission: vi.fn().mockResolvedValue(true),
			requestLoggingPermission: vi.fn().mockResolvedValue(true),
		} as unknown as Mocked<ChromeService>;

		// Setup getMessage mock to return translated text
		chromeServiceSpy.getMessage.mockImplementation((key: string, substitutions?: string[]) => {
			const translations: Record<string, string> = {
				Application_Prompt_NotAValidFusk: 'This is not a valid fusk - https://example.com/[1-8].jpg',
				Application_Prompt_NotAValidNumber: 'This is not a valid number.',
				Gallery_CopiedAllUrls: 'Copied $1 URLs to clipboard',
				Gallery_CopiedUrl: 'URL copied to clipboard',
				Gallery_CopyFailed: 'Failed to copy to clipboard',
				Gallery_DisableFullScreenGallery: 'Disable full-screen gallery layout',
				Gallery_DownloadAddingMetadata: 'Adding metadata...',
				Gallery_DownloadComplete: 'Download complete!',
				Gallery_DownloadCreatingZip: 'Creating ZIP file...',
				Gallery_DownloadFailed: 'Download failed',
				Gallery_DownloadingItem: 'Downloading $1 ($2 of $3)...',
				Gallery_DownloadInProgress_ConfirmLeave: 'A download is in progress. Navigating away will cancel it. Are you sure?',
				Gallery_DownloadNoImages: 'No images to download',
				Gallery_DownloadPreparing: 'Preparing download...',
				Gallery_DownloadSaving: 'Saving ZIP file...',
				Gallery_EnableFullScreenGallery: 'Enable full-screen gallery layout',
				Gallery_ErrorGenerating: 'Error generating gallery:',
				Gallery_ErrorNoPattern: 'No fuskable pattern found in the URL. Try a URL with numbers in the filename.',
				Gallery_ErrorValidUrl: 'Please enter a valid URL',
				Gallery_FillPage: 'Fill page',
				Gallery_FitPage: 'Fit on page',
				Gallery_FullWidth: 'Full width',
				Gallery_GenerateGallery: 'Generate Gallery',
				Gallery_HideBroken: 'Hide broken images',
				Gallery_ImageAlt: 'Image',
				Gallery_ImageNotFound: 'Image not found',
				Gallery_ShowBroken: 'Show broken images',
				Gallery_SkipToGallery: 'Skip to gallery',
				Gallery_SwitchToDarkMode: 'Switch to Dark Mode',
				Gallery_SwitchToLightMode: 'Switch to Light Mode',
				Gallery_Thumbnails: 'Thumbnails',
				Gallery_Title: 'Fuskr Gallery',
				Gallery_ViewHistory: 'View Gallery History',
				History_BrokenImages: 'Failed to Load',
				History_ClearAll: 'Clear All',
				History_DisplayMode: 'Display Mode',
				History_LoadedImages: 'Loaded Successfully',
				History_NewGallery: 'New Gallery',
				History_OpenInNewTab: 'Open in New Tab',
				History_RemoveEntry: 'Remove from History',
				History_SuccessRate: 'Success Rate',
				History_Title: 'Gallery History',
				History_TotalImages: 'Total Images',
				Options_Appearance: 'Appearance',
				Options_Behaviour: 'Behaviour',
				Options_DarkMode_Description: 'Changes the background of image sets to a darker colour. Will take effect once you refresh pages.',
				Options_DarkMode: 'Show Fuskr with a dark background',
				Options_DefaultImageDisplayMode: 'Default Image Display Mode:',
				Options_DisplayModeDescription: 'Choose how images are displayed by default in the gallery',
				Options_ErrorSaving: 'Error saving options',
				Options_FullScreenGalleryDefault: 'Use full-screen gallery layout by default',
				Options_FullScreenGalleryDescription: 'Allow the gallery to use the full page width instead of the standard 1400px layout',
				Options_History_Keep_Description: 'Every time you create a new gallery, the extension records the created url (up to the last 10). Clicking on the url will re-generate that gallery.',
				Options_History_Keep: 'Keep a recent history of fusks',
				Options_ImageDisplay: 'Image Display',
				Options_OpenNewFusksInForeground_Description: 'When you create a new gallery, you may not wish to open it in the foreground. By unchecking this option, any new gallery will appear in the background instead.',
				Options_OpenNewFusksInForeground: 'Open new fusks in the foreground',
				Options_ResizeImagesFillPage: 'Resize images to fill the page',
				Options_ResizeImagesFitOnPage: 'Resize images to fit on page',
				Options_ResizeImagesFullWidth: 'Resize images to full width',
				Options_ResizeImagesThumbnails: 'Resize images to thumbnails',
				Options_SettingsSaved: 'Options saved!',
				Options_ShowBrokenImagesDefault: 'Show broken images by default',
				Options_ShowBrokenImagesDescription: 'Display placeholder images for missing/broken images',
				Options_ShowImagesInViewerDefault: 'Show images in viewer by default',
				Options_ShowImagesInViewerDescription: 'Open images in a full-screen viewer when clicked',
				Options_Title: 'Fuskr Options',
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
		chromeServiceSpy.getStorageData.mockResolvedValue({} as IChromeStorageData);
		chromeServiceSpy.setStorageData.mockResolvedValue();
		chromeServiceSpy.updateDisplaySettings.mockResolvedValue();
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
