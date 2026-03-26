import { TestBed } from '@angular/core/testing';
import { ChromeService } from './chrome.service';
import { IChromeStorageData } from '@interfaces/chrome-storage';
import { ChromeStorageData } from '@models/chrome-storage';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

// Mock chrome API
const mockChrome = {
	storage: {
		sync: {
			get: vi.fn(),
			set: vi.fn(),
		},
	},
};

describe('ChromeService', () => {
	let service: ChromeService;

	beforeEach(() => {
		// Set up chrome mock
		(
			window as unknown as {
				chrome: typeof mockChrome;
			}
		).chrome = mockChrome;

		TestBed.configureTestingModule({});
		service = TestBed.inject(ChromeService);
	});

	afterEach(() => {
		// Clean up mocks
		mockChrome.storage.sync.get.mockClear();
		mockChrome.storage.sync.set.mockClear();
	});

	describe('Service Creation', () => {
		it('should be created', () => {
			expect(service).toBeTruthy();
		});
	});

	describe('getStorageData', () => {
		it('should return default data when chrome storage is empty', async () => {
			mockChrome.storage.sync.get.mockImplementation((_keys: unknown, callback: (result: Record<string, unknown>) => void) => {
				callback({});
			});

			const result = await service.getStorageData();

			// Should return all defaults when storage is empty
			expect(result).toBeDefined();
			expect(result.display.darkMode).toBe(false);
			expect(result.display.imageDisplayMode).toBe('fitOnPage');
			expect(result.display.resizeImagesToFitOnPage).toBe(true);
			expect(result.display.resizeImagesToFullWidth).toBe(false);
			expect(result.display.resizeImagesToFillPage).toBe(false);
			expect(result.display.resizeImagesToThumbnails).toBe(false);
			expect(result.display.showImagesInViewer).toBe(true);
			expect(result.display.toggleBrokenImages).toBe(true);
			expect(result.behaviour.openInForeground).toBe(true);
			expect(result.behaviour.keepRecentFusks).toBe(true);
			expect(result.behaviour.recentFusks).toEqual([]);
			expect(result.behaviour.galleryHistory.entries).toEqual([]);
			expect(result.behaviour.galleryHistory.maxEntries).toBe(10);
			expect(result.safety.enableOverloadProtection).toBe(true);
			expect(result.safety.overloadProtectionLimit).toBe(250);
			expect(result.version).toBe(1);
		});

		it('should return stored data merged with defaults when available', async () => {
			const storedData = {
				display: {
					darkMode: true,
				},
				behaviour: {
					keepRecentFusks: false,
					openInForeground: false,
				},
			};

			mockChrome.storage.sync.get.mockImplementation((_keys: unknown, callback: (result: Record<string, unknown>) => void) => {
				callback(storedData);
			});

			const result = await service.getStorageData();

			// Should merge stored data with defaults
			expect(result.display.darkMode).toBe(true); // from stored data
			expect(result.display.imageDisplayMode).toBe('fitOnPage'); // from defaults
			expect(result.display.resizeImagesToFitOnPage).toBe(true); // from defaults
			expect(result.display.resizeImagesToFullWidth).toBe(false); // from defaults
			expect(result.display.resizeImagesToFillPage).toBe(false); // from defaults
			expect(result.display.resizeImagesToThumbnails).toBe(false); // from defaults
			expect(result.display.showImagesInViewer).toBe(true); // from defaults
			expect(result.display.toggleBrokenImages).toBe(true); // from defaults

			expect(result.behaviour.keepRecentFusks).toBe(false); // from stored data
			expect(result.behaviour.openInForeground).toBe(false); // from stored data
			expect(result.behaviour.recentFusks).toEqual([]); // from defaults
			expect(result.behaviour.galleryHistory.entries).toEqual([]);
			expect(result.behaviour.galleryHistory.maxEntries).toBe(10);

			expect(result.safety.enableOverloadProtection).toBe(true); // from defaults
			expect(result.safety.overloadProtectionLimit).toBe(250); // from defaults
			expect(result.version).toBe(1);
		});

		it('should handle chrome storage errors gracefully', async () => {
			mockChrome.storage.sync.get.mockImplementation(() => {
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
			const testData = new ChromeStorageData({
				display: {
					autoRemoveBrokenImages: false,
					darkMode: true,
					imageDisplayMode: 'fitOnPage',
					resizeImagesToFitOnPage: true,
					resizeImagesToFullWidth: false,
					resizeImagesToFillPage: false,
					resizeImagesToThumbnails: false,
					showImagesInViewer: true,
					toggleBrokenImages: true,
				},
				behaviour: {
					keepRecentFusks: false,
					openInForeground: true,
					recentFusks: [],
					galleryHistory: {
						entries: [],
						maxEntries: 10,
					},
				},
				safety: {
					enableOverloadProtection: true,
					overloadProtectionLimit: 500,
				},
				version: 1,
			});

			mockChrome.storage.sync.set.mockImplementation((_data: unknown, callback: () => void) => {
				callback();
			});

			await service.setStorageData(testData);

			expect(mockChrome.storage.sync.set).toHaveBeenCalledWith(testData, expect.any(Function));
		});

		it('should handle storage errors when saving', async () => {
			const testData = new ChromeStorageData({
				display: {
					autoRemoveBrokenImages: false,
					darkMode: true,
					imageDisplayMode: 'fitOnPage',
					resizeImagesToFitOnPage: true,
					resizeImagesToFullWidth: false,
					resizeImagesToFillPage: false,
					resizeImagesToThumbnails: false,
					showImagesInViewer: true,
					toggleBrokenImages: true,
				},
				behaviour: {
					keepRecentFusks: false,
					openInForeground: true,
					recentFusks: [],
					galleryHistory: {
						entries: [],
						maxEntries: 10,
					},
				},
				safety: {
					enableOverloadProtection: true,
					overloadProtectionLimit: 500,
				},
				version: 1,
			});

			mockChrome.storage.sync.set.mockImplementation(() => {
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
				runtime: { id: 'test-extension-id' },
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

	describe('hasLoggingPermission', () => {
		it('should return true when browserAPI has no permissions property', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = {};
			expect(await testService.hasLoggingPermission()).toBe(true);
		});

		it('should return true when browserAPI is null', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = null;
			expect(await testService.hasLoggingPermission()).toBe(true);
		});

		it('should return true when getAll() does not include data_collection (Chrome behaviour)', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = {
				permissions: {
					getAll: vi.fn().mockResolvedValue({ permissions: [], origins: [] }),
				},
			};
			expect(await testService.hasLoggingPermission()).toBe(true);
		});

		it('should return true when data_collection includes technicalAndInteraction (Firefox granted)', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = {
				permissions: {
					getAll: vi.fn().mockResolvedValue({
						permissions: [],
						origins: [],
						data_collection: ['technicalAndInteraction'],
					}),
				},
			};
			expect(await testService.hasLoggingPermission()).toBe(true);
		});

		it('should return false when data_collection is present but does not include technicalAndInteraction', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = {
				permissions: {
					getAll: vi.fn().mockResolvedValue({
						permissions: [],
						origins: [],
						data_collection: [],
					}),
				},
			};
			expect(await testService.hasLoggingPermission()).toBe(false);
		});

		it('should return true when getAll() throws', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = {
				permissions: { getAll: vi.fn().mockRejectedValue(new Error('not supported')) },
			};
			expect(await testService.hasLoggingPermission()).toBe(true);
		});
	});

	describe('requestLoggingPermission', () => {
		it('should return true when browserAPI has no permissions property', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = {};
			expect(await testService.requestLoggingPermission()).toBe(true);
		});

		it('should return true when browserAPI is null', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = null;
			expect(await testService.requestLoggingPermission()).toBe(true);
		});

		it('should return true when the user grants the permission', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = {
				permissions: {
					request: vi.fn().mockResolvedValue(true),
				},
			};
			expect(await testService.requestLoggingPermission()).toBe(true);
		});

		it('should return false when the user denies the permission', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = {
				permissions: {
					request: vi.fn().mockResolvedValue(false),
				},
			};
			expect(await testService.requestLoggingPermission()).toBe(false);
		});

		it('should return true when request() throws (browser does not support data_collection)', async () => {
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = {
				permissions: {
					request: vi.fn().mockRejectedValue(new Error('not supported')),
				},
			};
			expect(await testService.requestLoggingPermission()).toBe(true);
		});

		it('should call request with data_collection technicalAndInteraction', async () => {
			const requestMock = vi.fn().mockResolvedValue(true);
			const testService = Object.create(ChromeService.prototype);
			testService.browserAPI = { permissions: { request: requestMock } };
			await testService.requestLoggingPermission();
			expect(requestMock).toHaveBeenCalledWith({ data_collection: ['technicalAndInteraction'] });
		});
	});

	describe('resetOptionsToDefaults', () => {
		it('should reset options to defaults while preserving history', async () => {
			const currentData: IChromeStorageData = {
				display: {
					autoRemoveBrokenImages: false,
					darkMode: true,
					imageDisplayMode: 'thumbnails',
					resizeImagesToFillPage: false,
					resizeImagesToFitOnPage: true,
					resizeImagesToFullWidth: false,
					resizeImagesToThumbnails: false,
					showImagesInViewer: false,
					toggleBrokenImages: true,
				},
				behaviour: {
					openInForeground: false,
					keepRecentFusks: true,
					recentFusks: ['recent1', 'recent2'],
					galleryHistory: {
						entries: [
							{
								id: 'test-id',
								originalUrl: 'test-url',
								timestamp: new Date(),
								totalImages: 10,
								loadedImages: 8,
								brokenImages: 2,
								imageUrls: ['url1', 'url2'],
								displayMode: 'thumbnails',
							},
						],
						maxEntries: 5,
					},
				},
				safety: { enableOverloadProtection: false, overloadProtectionLimit: 200 },
				version: 1,
			};

			// Mock getStorageData to return current data
			vi.spyOn(service, 'getStorageData').mockReturnValue(Promise.resolve(currentData));
			vi.spyOn(service, 'setStorageData').mockReturnValue(Promise.resolve());

			await service.resetOptionsToDefaults();

			expect(service.getStorageData).toHaveBeenCalled();
			expect(service.setStorageData).toHaveBeenCalled();

			// Verify the reset data preserves history but resets other options
			const resetData = vi.mocked(service.setStorageData).mock.lastCall?.[0];
			expect(resetData).toBeDefined();

			// History should be preserved
			expect(resetData!.behaviour.galleryHistory).toEqual(currentData.behaviour.galleryHistory);

			// Other options should be reset to defaults
			const defaults = new ChromeStorageData();
			expect(resetData!.display.darkMode).toBe(defaults.display.darkMode);
			expect(resetData!.display.imageDisplayMode).toBe(defaults.display.imageDisplayMode);
			expect(resetData!.behaviour.openInForeground).toBe(defaults.behaviour.openInForeground);
			expect(resetData!.safety.enableOverloadProtection).toBe(defaults.safety.enableOverloadProtection);
			expect(resetData!.safety.overloadProtectionLimit).toBe(defaults.safety.overloadProtectionLimit);
		});

		it('should handle errors during reset', async () => {
			vi.spyOn(service, 'getStorageData').mockReturnValue(Promise.reject(new Error('Storage error')));

			await expect(service.resetOptionsToDefaults()).rejects.toThrow();
		});
	});
});
