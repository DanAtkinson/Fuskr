import {
	DisplaySettings,
	BehaviourSettings,
	SafetySettings,
	ChromeStorageData
} from './chrome-storage.model';
import {
	IDisplaySettings,
	IBehaviourSettings,
	ISafetySettings,
	IChromeStorageData
} from '../interfaces/chrome-storage.interface';

describe('Chrome Storage Models', () => {
	
	describe('DisplaySettings', () => {
		it('should create instance with default values', () => {
			const settings = new DisplaySettings();

			expect(settings.darkMode).toBe(false);
			expect(settings.imageDisplayMode).toBe('fitOnPage');
			expect(settings.resizeImagesToFillPage).toBe(false);
			expect(settings.resizeImagesToFitOnPage).toBe(true);
			expect(settings.resizeImagesToFullWidth).toBe(false);
			expect(settings.resizeImagesToThumbnails).toBe(false);
			expect(settings.showImagesInViewer).toBe(true);
			expect(settings.toggleBrokenImages).toBe(true);
		});

		it('should create instance with provided data', () => {
			const data: Partial<IDisplaySettings> = {
				darkMode: true,
				imageDisplayMode: 'fullWidth',
				resizeImagesToFillPage: true,
				showImagesInViewer: false
			};

			const settings = new DisplaySettings(data);

			expect(settings.darkMode).toBe(true);
			expect(settings.imageDisplayMode).toBe('fullWidth');
			expect(settings.resizeImagesToFillPage).toBe(true);
			expect(settings.showImagesInViewer).toBe(false);
			// Check that defaults are still applied for non-provided values
			expect(settings.resizeImagesToFitOnPage).toBe(true);
			expect(settings.toggleBrokenImages).toBe(true);
		});

		it('should handle all possible imageDisplayMode values', () => {
			const modes: IDisplaySettings['imageDisplayMode'][] = ['fitOnPage', 'fullWidth', 'fillPage', 'thumbnails'];

			modes.forEach(mode => {
				const settings = new DisplaySettings({ imageDisplayMode: mode });
				expect(settings.imageDisplayMode).toBe(mode);
			});
		});

		it('should override all properties when provided', () => {
			const data: IDisplaySettings = {
				darkMode: true,
				imageDisplayMode: 'thumbnails',
				resizeImagesToFillPage: true,
				resizeImagesToFitOnPage: false,
				resizeImagesToFullWidth: true,
				resizeImagesToThumbnails: true,
				showImagesInViewer: false,
				toggleBrokenImages: false
			};

			const settings = new DisplaySettings(data);

			expect(settings.darkMode).toBe(true);
			expect(settings.imageDisplayMode).toBe('thumbnails');
			expect(settings.resizeImagesToFillPage).toBe(true);
			expect(settings.resizeImagesToFitOnPage).toBe(false);
			expect(settings.resizeImagesToFullWidth).toBe(true);
			expect(settings.resizeImagesToThumbnails).toBe(true);
			expect(settings.showImagesInViewer).toBe(false);
			expect(settings.toggleBrokenImages).toBe(false);
		});

		it('should handle empty object data', () => {
			const settings = new DisplaySettings({});

			// Should use all defaults
			expect(settings.darkMode).toBe(false);
			expect(settings.imageDisplayMode).toBe('fitOnPage');
		});

		it('should handle null values in data', () => {
			const data = {
				darkMode: null as any,
				imageDisplayMode: null as any
			};

			const settings = new DisplaySettings(data);

			expect(settings.darkMode).toBeNull();
			expect(settings.imageDisplayMode).toBeNull();
		});
	});

	describe('BehaviourSettings', () => {
		it('should create instance with default values', () => {
			const settings = new BehaviourSettings();

			expect(settings.galleryHistory).toEqual({
				entries: [],
				maxEntries: 10
			});
			expect(settings.keepRecentFusks).toBe(true);
			expect(settings.openInForeground).toBe(true);
			expect(settings.recentFusks).toEqual([]);
		});

		it('should create instance with provided data', () => {
			const data: Partial<IBehaviourSettings> = {
				keepRecentFusks: false,
				openInForeground: false,
				recentFusks: ['url1', 'url2', 'url3']
			};

			const settings = new BehaviourSettings(data);

			expect(settings.keepRecentFusks).toBe(false);
			expect(settings.openInForeground).toBe(false);
			expect(settings.recentFusks).toEqual(['url1', 'url2', 'url3']);
			// Check that default gallery history is still applied
			expect(settings.galleryHistory.maxEntries).toBe(10);
		});

		it('should handle custom gallery history', () => {
			const customHistory = {
				entries: [
					{
						id: 'test-1',
						originalUrl: 'https://example.com/test',
						timestamp: new Date(),
						totalImages: 5,
						loadedImages: 3,
						brokenImages: 2,
						imageUrls: ['url1.jpg', 'url2.jpg', 'url3.jpg'],
						displayMode: 'fitOnPage' as const
					}
				],
				maxEntries: 20
			};

			const data: Partial<IBehaviourSettings> = {
				galleryHistory: customHistory
			};

			const settings = new BehaviourSettings(data);

			expect(settings.galleryHistory.maxEntries).toBe(20);
			expect(settings.galleryHistory.entries.length).toBe(1);
			expect(settings.galleryHistory.entries[0].id).toBe('test-1');
		});

		it('should handle large recentFusks array', () => {
			const largeArray = Array.from({ length: 100 }, (_, i) => `https://example.com/image${i}.jpg`);
			const data: Partial<IBehaviourSettings> = {
				recentFusks: largeArray
			};

			const settings = new BehaviourSettings(data);

			expect(settings.recentFusks.length).toBe(100);
			expect(settings.recentFusks[0]).toBe('https://example.com/image0.jpg');
			expect(settings.recentFusks[99]).toBe('https://example.com/image99.jpg');
		});

		it('should handle empty arrays', () => {
			const data: Partial<IBehaviourSettings> = {
				recentFusks: [],
				galleryHistory: {
					entries: [],
					maxEntries: 0
				}
			};

			const settings = new BehaviourSettings(data);

			expect(settings.recentFusks).toEqual([]);
			expect(settings.galleryHistory.entries).toEqual([]);
			expect(settings.galleryHistory.maxEntries).toBe(0);
		});
	});

	describe('SafetySettings', () => {
		it('should create instance with default values', () => {
			const settings = new SafetySettings();

			expect(settings.enableOverloadProtection).toBe(true);
			expect(settings.overloadProtectionLimit).toBe(50);
		});

		it('should create instance with provided data', () => {
			const data: Partial<ISafetySettings> = {
				enableOverloadProtection: false,
				overloadProtectionLimit: 100
			};

			const settings = new SafetySettings(data);

			expect(settings.enableOverloadProtection).toBe(false);
			expect(settings.overloadProtectionLimit).toBe(100);
		});

		it('should handle various limit values', () => {
			const testLimits = [0, 1, 25, 50, 100, 500, 1000, 10000];

			testLimits.forEach(limit => {
				const settings = new SafetySettings({ overloadProtectionLimit: limit });
				expect(settings.overloadProtectionLimit).toBe(limit);
			});
		});

		it('should handle negative limit values', () => {
			const settings = new SafetySettings({ overloadProtectionLimit: -10 });
			expect(settings.overloadProtectionLimit).toBe(-10);
		});

		it('should handle decimal limit values', () => {
			const settings = new SafetySettings({ overloadProtectionLimit: 50.5 });
			expect(settings.overloadProtectionLimit).toBe(50.5);
		});

		it('should handle boolean toggle independently', () => {
			const settings1 = new SafetySettings({ enableOverloadProtection: true });
			const settings2 = new SafetySettings({ enableOverloadProtection: false });

			expect(settings1.enableOverloadProtection).toBe(true);
			expect(settings2.enableOverloadProtection).toBe(false);
			// Both should have default limit
			expect(settings1.overloadProtectionLimit).toBe(50);
			expect(settings2.overloadProtectionLimit).toBe(50);
		});
	});

	describe('ChromeStorageData', () => {
		it('should create instance with default values', () => {
			const data = new ChromeStorageData();

			expect(data.version).toBe(1);
			expect(data.display).toBeInstanceOf(DisplaySettings);
			expect(data.behaviour).toBeInstanceOf(BehaviourSettings);
			expect(data.safety).toBeInstanceOf(SafetySettings);

			// Check nested defaults
			expect(data.display.darkMode).toBe(false);
			expect(data.behaviour.keepRecentFusks).toBe(true);
			expect(data.safety.enableOverloadProtection).toBe(true);
		});

		it('should create instance with provided data', () => {
			const inputData: Partial<IChromeStorageData> = {
				version: 2,
				display: {
					darkMode: true,
					imageDisplayMode: 'fullWidth',
					resizeImagesToFillPage: false,
					resizeImagesToFitOnPage: true,
					resizeImagesToFullWidth: false,
					resizeImagesToThumbnails: false,
					showImagesInViewer: true,
					toggleBrokenImages: true
				},
				behaviour: {
					galleryHistory: { entries: [], maxEntries: 10 },
					keepRecentFusks: true,
					openInForeground: false,
					recentFusks: ['test1', 'test2']
				},
				safety: {
					enableOverloadProtection: false,
					overloadProtectionLimit: 75
				}
			};

			const data = new ChromeStorageData(inputData);

			expect(data.version).toBe(2);
			expect(data.display.darkMode).toBe(true);
			expect(data.display.imageDisplayMode).toBe('fullWidth');
			expect(data.behaviour.openInForeground).toBe(false);
			expect(data.behaviour.recentFusks).toEqual(['test1', 'test2']);
			expect(data.safety.enableOverloadProtection).toBe(false);
			expect(data.safety.overloadProtectionLimit).toBe(75);
		});

		it('should handle partial nested data', () => {
			const inputData: Partial<IChromeStorageData> = {
				display: {
					darkMode: true,
					imageDisplayMode: 'fitOnPage',
					resizeImagesToFillPage: false,
					resizeImagesToFitOnPage: true,
					resizeImagesToFullWidth: false,
					resizeImagesToThumbnails: false,
					showImagesInViewer: true,
					toggleBrokenImages: true
				}
				// Missing behaviour and safety entirely
			};

			const data = new ChromeStorageData(inputData);

			// Should have provided display.darkMode
			expect(data.display.darkMode).toBe(true);
			// Should have default for missing display properties
			expect(data.display.imageDisplayMode).toBe('fitOnPage');
			// Should have defaults for missing sections
			expect(data.behaviour.keepRecentFusks).toBe(true);
			expect(data.safety.enableOverloadProtection).toBe(true);
		});

		it('should handle undefined version', () => {
			const data = new ChromeStorageData({ version: undefined as any });
			expect(data.version).toBe(1); // Should use default
		});

		it('should handle all sections with custom data', () => {
			const fullData: IChromeStorageData = {
				version: 3,
				display: {
					darkMode: true,
					imageDisplayMode: 'thumbnails',
					resizeImagesToFillPage: true,
					resizeImagesToFitOnPage: false,
					resizeImagesToFullWidth: true,
					resizeImagesToThumbnails: false,
					showImagesInViewer: false,
					toggleBrokenImages: false
				},
				behaviour: {
					galleryHistory: {
						entries: [],
						maxEntries: 25
					},
					keepRecentFusks: false,
					openInForeground: false,
					recentFusks: ['url1', 'url2']
				},
				safety: {
					enableOverloadProtection: false,
					overloadProtectionLimit: 200
				}
			};

			const data = new ChromeStorageData(fullData);

			expect(data.version).toBe(3);
			expect(data.display.darkMode).toBe(true);
			expect(data.display.imageDisplayMode).toBe('thumbnails');
			expect(data.behaviour.galleryHistory.maxEntries).toBe(25);
			expect(data.behaviour.keepRecentFusks).toBe(false);
			expect(data.safety.overloadProtectionLimit).toBe(200);
		});

		it('should create proper instances of nested classes', () => {
			const data = new ChromeStorageData();

			expect(data.display).toBeInstanceOf(DisplaySettings);
			expect(data.behaviour).toBeInstanceOf(BehaviourSettings);
			expect(data.safety).toBeInstanceOf(SafetySettings);
		});

		it('should handle empty object', () => {
			const data = new ChromeStorageData({});

			expect(data.version).toBe(1);
			expect(data.display).toBeInstanceOf(DisplaySettings);
			expect(data.behaviour).toBeInstanceOf(BehaviourSettings);
			expect(data.safety).toBeInstanceOf(SafetySettings);
		});

		it('should handle null input', () => {
			const data = new ChromeStorageData(null as any);

			expect(data.version).toBe(1);
			expect(data.display).toBeInstanceOf(DisplaySettings);
		});
	});

	describe('Model Integration', () => {
		it('should work together in realistic scenario', () => {
			const userData = {
				version: 2,
				display: { 
					darkMode: true, 
					imageDisplayMode: 'fullWidth' as const,
					resizeImagesToFillPage: false,
					resizeImagesToFitOnPage: true,
					resizeImagesToFullWidth: false,
					resizeImagesToThumbnails: false,
					showImagesInViewer: true,
					toggleBrokenImages: true
				},
				behaviour: { 
					galleryHistory: { entries: [], maxEntries: 10 },
					keepRecentFusks: true,
					openInForeground: false,
					recentFusks: ['https://site1.com/[1-10].jpg', 'https://site2.com/[a-z].png']
				},
				safety: { 
					enableOverloadProtection: true,
					overloadProtectionLimit: 100 
				}
			};

			const storage = new ChromeStorageData(userData);

			expect(storage.version).toBe(2);
			expect(storage.display.darkMode).toBe(true);
			expect(storage.display.imageDisplayMode).toBe('fullWidth');
			expect(storage.behaviour.openInForeground).toBe(false);
			expect(storage.behaviour.recentFusks.length).toBe(2);
			expect(storage.safety.overloadProtectionLimit).toBe(100);
			expect(storage.safety.enableOverloadProtection).toBe(true); // Default value
		});

		it('should maintain data integrity across instantiation', () => {
			const original = {
				display: { 
					darkMode: true,
					imageDisplayMode: 'fitOnPage' as const,
					resizeImagesToFillPage: false,
					resizeImagesToFitOnPage: true,
					resizeImagesToFullWidth: false,
					resizeImagesToThumbnails: false,
					showImagesInViewer: true,
					toggleBrokenImages: true
				},
				behaviour: { 
					galleryHistory: { entries: [], maxEntries: 10 },
					keepRecentFusks: true,
					openInForeground: true,
					recentFusks: ['test'] 
				},
				safety: { 
					enableOverloadProtection: true,
					overloadProtectionLimit: 99 
				}
			};

			const storage = new ChromeStorageData(original);

			// Original should not be modified
			expect(original.display.darkMode).toBe(true);
			// Storage should have correct values
			expect(storage.display.darkMode).toBe(true);
			expect(storage.behaviour.recentFusks[0]).toBe('test');
			expect(storage.safety.overloadProtectionLimit).toBe(99);
		});
	});
});
