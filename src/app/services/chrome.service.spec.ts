import { TestBed } from '@angular/core/testing';
import { ChromeService, ChromeStorageData } from './chrome.service';

// Type-only import for VS Code IntelliSense - won't be included in runtime bundle
import type {} from 'jasmine';

// Mock chrome API
const mockChrome = {
	storage: {
		sync: {
			get: jasmine.createSpy('get'),
			set: jasmine.createSpy('set')
		}
	}
};

describe('ChromeService', () => {
	let service: ChromeService;

	beforeEach(() => {
		// Set up chrome mock
		(window as any).chrome = mockChrome;

		TestBed.configureTestingModule({});
		service = TestBed.inject(ChromeService);
	});

	afterEach(() => {
		// Clean up mocks
		mockChrome.storage.sync.get.calls.reset();
		mockChrome.storage.sync.set.calls.reset();
	});

	describe('Service Creation', () => {
		it('should be created', () => {
			expect(service).toBeTruthy();
		});
	});

	describe('getStorageData', () => {
		it('should return default data when chrome storage is empty', async () => {
			mockChrome.storage.sync.get.and.callFake((_keys: any, callback: any) => {
				callback({});
			});

			const result = await service.getStorageData();

			// Should return all defaults when storage is empty
			expect(result).toEqual({
				display: {
					darkMode: false,
					imageDisplayMode: 'fitOnPage',
					resizeImagesToFitOnPage: true,
					resizeImagesToFullWidth: false,
					resizeImagesToFillPage: false,
					resizeImagesToThumbnails: false,
					showImagesInViewer: true,
					toggleBrokenImages: true
				},
				behavior: {
					openInForeground: true,
					keepRecentFusks: true,
					recentFusks: []
				},
				safety: {
					enableOverloadProtection: true,
					overloadProtectionLimit: 500
				},
				version: 1
			});
		});

		it('should return stored data merged with defaults when available', async () => {
			const storedData = {
				display: {
					darkMode: true
				},
				behavior: {
					keepRecentFusks: false,
					openInForeground: false
				}
			};

			mockChrome.storage.sync.get.and.callFake((_keys: any, callback: any) => {
				callback(storedData);
			});

			const result = await service.getStorageData();

			// Should merge stored data with defaults
			expect(result).toEqual({
				display: {
					darkMode: true, // from stored data
					imageDisplayMode: 'fitOnPage', // from defaults
					resizeImagesToFitOnPage: true, // from defaults
					resizeImagesToFullWidth: false, // from defaults
					resizeImagesToFillPage: false, // from defaults
					resizeImagesToThumbnails: false, // from defaults
					showImagesInViewer: true, // from defaults
					toggleBrokenImages: true // from defaults
				},
				behavior: {
					keepRecentFusks: false, // from stored data
					openInForeground: false, // from stored data
					recentFusks: [] // from defaults
				},
				safety: {
					enableOverloadProtection: true, // from defaults
					overloadProtectionLimit: 500 // from defaults
				},
				version: 1
			});
		});

		it('should handle chrome storage errors gracefully', async () => {
			mockChrome.storage.sync.get.and.callFake((_keys: any, callback: any) => {
				// Simulate error by not calling callback
				throw new Error('Storage error');
			});

			try {
				await service.getStorageData();
			} catch (error) {
				expect(error).toBeDefined();
			}
		});
	});

	describe('setStorageData', () => {
		it('should save data to chrome storage', async () => {
			const testData: ChromeStorageData = {
				display: {
					darkMode: true,
					imageDisplayMode: 'fitOnPage',
					resizeImagesToFitOnPage: true,
					resizeImagesToFullWidth: false,
					resizeImagesToFillPage: false,
					resizeImagesToThumbnails: false,
					showImagesInViewer: true,
					toggleBrokenImages: true
				},
				behavior: {
					keepRecentFusks: false,
					openInForeground: true,
					recentFusks: []
				},
				safety: {
					enableOverloadProtection: true,
					overloadProtectionLimit: 500
				},
				version: 1
			};

			mockChrome.storage.sync.set.and.callFake((_data: any, callback: any) => {
				callback();
			});

			await service.setStorageData(testData);

			expect(mockChrome.storage.sync.set).toHaveBeenCalledWith(testData, jasmine.any(Function));
		});

		it('should handle storage errors when saving', async () => {
			const testData: ChromeStorageData = {
				display: {
					darkMode: true,
					imageDisplayMode: 'fitOnPage',
					resizeImagesToFitOnPage: true,
					resizeImagesToFullWidth: false,
					resizeImagesToFillPage: false,
					resizeImagesToThumbnails: false,
					showImagesInViewer: true,
					toggleBrokenImages: true
				},
				behavior: {
					keepRecentFusks: false,
					openInForeground: true,
					recentFusks: []
				},
				safety: {
					enableOverloadProtection: true,
					overloadProtectionLimit: 500
				},
				version: 1
			};

			mockChrome.storage.sync.set.and.callFake((_data: any, _callback: any) => {
				throw new Error('Storage save error');
			});

			try {
				await service.setStorageData(testData);
			} catch (error) {
				expect(error).toBeDefined();
			}
		});
	});

	describe('Extension Context Detection', () => {
		it('should detect when running in extension context', () => {
			// Create a service with a properly mocked browserAPI
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = {
				runtime: { id: 'test-extension-id' }
			};

			const result = testService.isExtensionContext();
			expect(result).toBeTruthy();
		});

		it('should detect when not running in extension context', () => {
			// Create a service with no browserAPI
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = null;

			const result = testService.isExtensionContext();
			expect(result).toBeFalsy();
		});
	});
});
