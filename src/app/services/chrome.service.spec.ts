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

	describe('history management', () => {
		it('should add a new gallery entry to the start of history', async () => {
			const currentData = new ChromeStorageData({
				behaviour: {
					galleryHistory: {
						entries: [],
						maxEntries: 10,
					},
				},
			});

			vi.spyOn(service, 'getStorageData').mockResolvedValue(currentData);
			vi.spyOn(service, 'updateBehaviourSettings').mockResolvedValue();

			await service.addGalleryToHistory({
				originalUrl: 'https://example.com/gallery[001-010].jpg',
				totalImages: 10,
				loadedImages: 8,
				brokenImages: 2,
				imageUrls: [],
				displayMode: 'fitOnPage',
			});

			expect(service.updateBehaviourSettings).toHaveBeenCalledTimes(1);
			const updateArg = vi.mocked(service.updateBehaviourSettings).mock.calls[0][0];
			expect(updateArg.galleryHistory?.entries).toHaveLength(1);
			expect(updateArg.galleryHistory?.entries[0].originalUrl).toBe(btoa('https://example.com/gallery[001-010].jpg'));
			expect(updateArg.galleryHistory?.entries[0].id).toMatch(/^gallery_/);
		});

		it('should update an existing gallery entry and preserve its id', async () => {
			const encodedUrl = btoa('https://example.com/gallery[001-010].jpg');
			const currentData = new ChromeStorageData({
				behaviour: {
					galleryHistory: {
						entries: [
							{
								id: 'existing-id',
								originalUrl: encodedUrl,
								timestamp: new Date('2024-01-01T00:00:00.000Z'),
								totalImages: 1,
								loadedImages: 1,
								brokenImages: 0,
								imageUrls: [],
								displayMode: 'fitOnPage',
							},
							{
								id: 'other-id',
								originalUrl: btoa('https://example.com/other[001-010].jpg'),
								timestamp: new Date('2024-01-02T00:00:00.000Z'),
								totalImages: 2,
								loadedImages: 2,
								brokenImages: 0,
								imageUrls: [],
								displayMode: 'thumbnails',
							},
						],
						maxEntries: 10,
					},
				},
			});

			vi.spyOn(service, 'getStorageData').mockResolvedValue(currentData);
			vi.spyOn(service, 'updateBehaviourSettings').mockResolvedValue();

			await service.addGalleryToHistory({
				originalUrl: 'https://example.com/gallery[001-010].jpg',
				totalImages: 10,
				loadedImages: 9,
				brokenImages: 1,
				imageUrls: [],
				displayMode: 'fullWidth',
			});

			const entries = vi.mocked(service.updateBehaviourSettings).mock.calls[0][0].galleryHistory?.entries;
			expect(entries?.[0].id).toBe('existing-id');
			expect(entries?.[0].displayMode).toBe('fullWidth');
			expect(entries?.[1].id).toBe('other-id');
		});

		it('should trim history to the maximum entry count', async () => {
			const existingEntries = Array.from({ length: 3 }, (_, index) => ({
				id: `existing-${index}`,
				originalUrl: btoa(`https://example.com/item-${index}.jpg`),
				timestamp: new Date('2024-01-01T00:00:00.000Z'),
				totalImages: 1,
				loadedImages: 1,
				brokenImages: 0,
				imageUrls: [],
				displayMode: 'fitOnPage' as const,
			}));

			const currentData = new ChromeStorageData({
				behaviour: {
					galleryHistory: {
						entries: existingEntries,
						maxEntries: 3,
					},
				},
			});

			vi.spyOn(service, 'getStorageData').mockResolvedValue(currentData);
			vi.spyOn(service, 'updateBehaviourSettings').mockResolvedValue();

			await service.addGalleryToHistory({
				originalUrl: 'https://example.com/new-item.jpg',
				totalImages: 1,
				loadedImages: 1,
				brokenImages: 0,
				imageUrls: [],
				displayMode: 'fitOnPage',
			});

			const entries = vi.mocked(service.updateBehaviourSettings).mock.calls[0][0].galleryHistory?.entries;
			expect(entries).toHaveLength(3);
			expect(entries?.some((entry) => entry.originalUrl === btoa('https://example.com/new-item.jpg'))).toBe(true);
		});

		it('should clear gallery history back to defaults', async () => {
			vi.spyOn(service, 'updateBehaviourSettings').mockResolvedValue();

			await service.clearGalleryHistory();

			expect(service.updateBehaviourSettings).toHaveBeenCalledWith({
				galleryHistory: {
					entries: [],
					maxEntries: 10,
				},
			});
		});

		it('should remove a gallery entry by id', async () => {
			const currentData = new ChromeStorageData({
				behaviour: {
					galleryHistory: {
						entries: [
							{
								id: 'keep-me',
								originalUrl: btoa('https://example.com/keep.jpg'),
								timestamp: new Date('2024-01-01T00:00:00.000Z'),
								totalImages: 1,
								loadedImages: 1,
								brokenImages: 0,
								imageUrls: [],
								displayMode: 'fitOnPage',
							},
							{
								id: 'remove-me',
								originalUrl: btoa('https://example.com/remove.jpg'),
								timestamp: new Date('2024-01-01T00:00:00.000Z'),
								totalImages: 1,
								loadedImages: 1,
								brokenImages: 0,
								imageUrls: [],
								displayMode: 'fitOnPage',
							},
						],
						maxEntries: 10,
					},
				},
			});

			vi.spyOn(service, 'getStorageData').mockResolvedValue(currentData);
			vi.spyOn(service, 'updateBehaviourSettings').mockResolvedValue();

			await service.removeGalleryFromHistory('remove-me');

			const entries = vi.mocked(service.updateBehaviourSettings).mock.calls[0][0].galleryHistory?.entries;
			expect(entries).toHaveLength(1);
			expect(entries?.[0].id).toBe('keep-me');
		});

		it('should normalise history timestamps and decode stored URLs', async () => {
			const logger = service as unknown as { logger: { warn: ReturnType<typeof vi.fn> } };
			logger.logger.warn = vi.fn();

			vi.spyOn(service, 'getStorageData').mockResolvedValue(
				new ChromeStorageData({
					behaviour: {
						galleryHistory: {
							entries: [
								{
									id: 'string-date',
									originalUrl: btoa('https://example.com/string.jpg'),
									timestamp: '2024-02-01T00:00:00.000Z' as unknown as Date,
									totalImages: 1,
									loadedImages: 1,
									brokenImages: 0,
									imageUrls: [],
									displayMode: 'fitOnPage',
								},
								{
									id: 'number-date',
									originalUrl: 'https://example.com/plain.jpg',
									timestamp: Date.parse('2024-03-01T00:00:00.000Z') as unknown as Date,
									totalImages: 1,
									loadedImages: 1,
									brokenImages: 0,
									imageUrls: [],
									displayMode: 'fitOnPage',
								},
								{
									id: 'invalid-shape',
									originalUrl: btoa('https://example.com/object.jpg'),
									timestamp: { foo: 'bar' } as unknown as Date,
									totalImages: 1,
									loadedImages: 1,
									brokenImages: 0,
									imageUrls: [],
									displayMode: 'fitOnPage',
								},
								{
									id: 'invalid-date',
									originalUrl: btoa('https://example.com/invalid-date.jpg'),
									timestamp: 'not-a-date' as unknown as Date,
									totalImages: 1,
									loadedImages: 1,
									brokenImages: 0,
									imageUrls: [],
									displayMode: 'fitOnPage',
								},
							],
							maxEntries: 10,
						},
					},
				})
			);

			const history = await service.getGalleryHistory();

			expect(history.entries[0].originalUrl).toBe('https://example.com/string.jpg');
			expect(history.entries[1].originalUrl).toBe('https://example.com/plain.jpg');
			expect(history.entries.every((entry) => entry.timestamp instanceof Date)).toBe(true);
			expect(logger.logger.warn).toHaveBeenCalledTimes(2);
		});
	});

	describe('browser API wrappers', () => {
		it('should use the downloads API when available', async () => {
			const download = vi.fn();
			(service as unknown as { browserAPI: unknown }).browserAPI = {
				downloads: { download },
			};

			await service.downloadFile('https://example.com/file.jpg', 'file.jpg');

			expect(download).toHaveBeenCalledWith({
				url: 'https://example.com/file.jpg',
				filename: 'file.jpg',
			});
		});

		it('should fall back to an anchor download when downloads API is unavailable', async () => {
			const click = vi.fn();
			const anchor = { href: '', download: '', click } as unknown as HTMLAnchorElement;
			const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
			(service as unknown as { browserAPI: unknown }).browserAPI = null;

			await service.downloadFile('https://example.com/file.jpg', 'file.jpg');

			expect(createElementSpy).toHaveBeenCalledWith('a');
			expect(anchor.href).toBe('https://example.com/file.jpg');
			expect(anchor.download).toBe('file.jpg');
			expect(click).toHaveBeenCalledTimes(1);
		});

		it('should return the active tab when tabs API is available', async () => {
			(service as unknown as { browserAPI: unknown }).browserAPI = {
				tabs: {
					query: vi.fn((_query, callback: (tabs: { id: number }[]) => void) => callback([{ id: 42 }])),
					create: vi.fn(),
				},
			};

			await expect(service.getCurrentTab()).resolves.toEqual({ id: 42 });
		});

		it('should return null when there is no current tab or tabs API', async () => {
			(service as unknown as { browserAPI: unknown }).browserAPI = {
				tabs: {
					query: vi.fn((_query, callback: (tabs: never[]) => void) => callback([])),
					create: vi.fn(),
				},
			};
			await expect(service.getCurrentTab()).resolves.toBeNull();

			(service as unknown as { browserAPI: unknown }).browserAPI = null;
			await expect(service.getCurrentTab()).resolves.toBeNull();
		});

		it('should use i18n messages when available and fall back to the key otherwise', () => {
			(service as unknown as { browserAPI: unknown }).browserAPI = {
				i18n: {
					getMessage: vi.fn().mockReturnValue('Translated'),
				},
			};
			expect(service.getMessage('Some_Key', ['1'])).toBe('Translated');

			(service as unknown as { browserAPI: unknown }).browserAPI = {
				i18n: {
					getMessage: vi.fn().mockReturnValue(''),
				},
			};
			expect(service.getMessage('Some_Key')).toBe('Some_Key');

			(service as unknown as { browserAPI: unknown }).browserAPI = null;
			expect(service.getMessage('Fallback_Key')).toBe('Fallback_Key');
		});

		it('should open a tab in the current window when tabs API is available', async () => {
			const create = vi.fn((_props, callback?: () => void) => callback?.());
			const query = vi.fn((_query, callback: (tabs: { windowId: number }[]) => void) => callback([{ windowId: 7 }]));
			(service as unknown as { browserAPI: unknown }).browserAPI = {
				tabs: { query, create },
			};

			await service.openTab('https://example.com/view', false);

			expect(create).toHaveBeenCalledWith(
				{
					url: 'https://example.com/view',
					active: false,
					windowId: 7,
				},
				expect.any(Function)
			);
		});

		it('should fall back to window.open when tabs API is unavailable', async () => {
			const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
			(service as unknown as { browserAPI: unknown }).browserAPI = null;

			await service.openTab('https://example.com/view');

			expect(openSpy).toHaveBeenCalledWith('https://example.com/view', '_blank');
		});
	});

	describe('settings accessors and updates', () => {
		it('should return simple setting values from storage', async () => {
			vi.spyOn(service, 'getStorageData').mockResolvedValue(
				new ChromeStorageData({
					display: { darkMode: true },
					safety: { enableOverloadProtection: false, overloadProtectionLimit: 999 },
					behaviour: { openInForeground: false },
				})
			);

			await expect(service.getDarkMode()).resolves.toBe(true);
			await expect(service.getEnableOverloadProtection()).resolves.toBe(false);
			await expect(service.getOverloadProtectionLimit()).resolves.toBe(999);
			await expect(service.getOpenInForeground()).resolves.toBe(false);
		});

		it('should merge behaviour updates into the existing storage data', async () => {
			const currentData = new ChromeStorageData({
				behaviour: { openInForeground: true, keepRecentFusks: true },
			});
			vi.spyOn(service, 'getStorageData').mockResolvedValue(currentData);
			vi.spyOn(service, 'setStorageData').mockResolvedValue();

			await service.updateBehaviourSettings({ openInForeground: false });

			expect(service.setStorageData).toHaveBeenCalledWith(
				expect.objectContaining({
					behaviour: expect.objectContaining({
						openInForeground: false,
						keepRecentFusks: true,
					}),
				})
			);
		});

		it('should merge display and safety updates into the existing storage data', async () => {
			const currentData = new ChromeStorageData({
				display: { darkMode: false, imageDisplayMode: 'fitOnPage' },
				safety: { enableOverloadProtection: true, overloadProtectionLimit: 250 },
			});
			vi.spyOn(service, 'getStorageData').mockResolvedValue(currentData);
			vi.spyOn(service, 'setStorageData').mockResolvedValue();

			await service.updateDisplaySettings({ darkMode: true });
			expect(service.setStorageData).toHaveBeenCalledWith(
				expect.objectContaining({
					display: expect.objectContaining({
						darkMode: true,
						imageDisplayMode: 'fitOnPage',
					}),
				})
			);

			await service.updateSafetySettings({ overloadProtectionLimit: 500 });
			expect(service.setStorageData).toHaveBeenLastCalledWith(
				expect.objectContaining({
					safety: expect.objectContaining({
						enableOverloadProtection: true,
						overloadProtectionLimit: 500,
					}),
				})
			);
		});

		it('should resolve setStorageData in development fallback mode', async () => {
			(service as unknown as { browserAPI: unknown }).browserAPI = null;

			await expect(service.setStorageData({ version: 2 })).resolves.toBeUndefined();
		});
	});
});
