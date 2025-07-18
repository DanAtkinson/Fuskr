import { TestBed } from '@angular/core/testing';
import { ChromeService } from '../services/chrome.service';

/**
 * Base test setup for components that extend BaseComponent
 */
export class BaseComponentTestHelper {
	static setupChromeServiceMock(): jasmine.SpyObj<ChromeService> {
		const chromeServiceSpy = jasmine.createSpyObj('ChromeService', ['getStorageData', 'setStorageData', 'getMessage']);
		
		// Setup getMessage mock to return translated text
		chromeServiceSpy.getMessage.and.callFake((key: string) => {
			const translations: { [key: string]: string } = {
				'Options_Title': 'Fuskr Options',
				'Options_Appearance': 'Appearance',
				'Options_ImageDisplay': 'Image Display',
				'Options_Behavior': 'Behavior',
				'Options_DarkMode': 'Show Fuskr with a dark background',
				'Options_DarkMode_Description': 'Changes the background of image sets to a darker colour. Will take effect once you refresh pages.',
				'Options_DefaultImageDisplayMode': 'Default Image Display Mode:',
				'Options_DisplayModeDescription': 'Choose how images are displayed by default in the gallery',
				'Options_ResizeImagesFitOnPage': 'Resize images to fit on page',
				'Options_ResizeImagesFullWidth': 'Resize images to full width',
				'Options_ResizeImagesFillPage': 'Resize images to fill the page',
				'Options_ResizeImagesThumbnails': 'Resize images to thumbnails',
				'Options_ShowImagesInViewerDefault': 'Show images in viewer by default',
				'Options_ShowImagesInViewerDescription': 'Open images in a full-screen viewer when clicked',
				'Options_ShowBrokenImagesDefault': 'Show broken images by default',
				'Options_ShowBrokenImagesDescription': 'Display placeholder images for missing/broken images',
				'Options_OpenNewFusksInForeground': 'Open new fusks in the foreground',
				'Options_OpenNewFusksInForeground_Description': 'When you create a new gallery, you may not wish to open it in the foreground. By unchecking this option, any new gallery will appear in the background instead.',
				'Options_History_Keep': 'Keep a recent history of fusks',
				'Options_History_Keep_Description': 'Every time you create a new gallery, the extension records the created url (up to the last 10). Clicking on the url will re-generate that gallery.',
				'Options_SettingsSaved': 'Options saved!',
				'Gallery_Title': 'Fuskr Gallery',
				'Gallery_SwitchToLightMode': 'Switch to Light Mode',
				'Gallery_SwitchToDarkMode': 'Switch to Dark Mode',
				'Gallery_GenerateGallery': 'Generate Gallery',
				'Gallery_DisplayMode': 'Display Mode',
				'Gallery_FitOnPage': 'Fit on page',
				'Gallery_FullWidth': 'Full width',
				'Gallery_FillPage': 'Fill page',
				'Gallery_Thumbnails': 'Thumbnails',
				'Gallery_ShowBrokenImages': 'Show broken images',
				'Gallery_HideBrokenImages': 'Hide broken images',
				'Gallery_RemoveBrokenImages': 'Remove broken images',
				'Gallery_ViewImage': 'View image',
				'Gallery_DownloadImage': 'Download image',
				'Gallery_ImageAlt': 'Image'
			};
			return translations[key] || key;
		});

		return chromeServiceSpy;
	}

	static configureMockChromeService(): void {
		const spy = this.setupChromeServiceMock();
		TestBed.configureTestingModule({
			providers: [
				{ provide: ChromeService, useValue: spy }
			]
		});
	}
}
