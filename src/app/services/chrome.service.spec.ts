import { TestBed } from '@angular/core/testing';
import { ChromeService } from './chrome.service';
import { IChromeStorageData } from '@interfaces/chrome-storage';
import { ChromeStorageData } from '@models/chrome-storage';

// Type-only import for VS Code IntelliSense - won't be included in runtime bundle
import type {} from 'jasmine';

// Mock chrome API
const mockChrome = {
  storage: {
    sync: {
      get: jasmine.createSpy('get'),
      set: jasmine.createSpy('set'),
    },
  },
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
      expect(result.safety.overloadProtectionLimit).toBe(50);
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

      mockChrome.storage.sync.get.and.callFake((_keys: any, callback: any) => {
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
      expect(result.safety.overloadProtectionLimit).toBe(50); // from defaults
      expect(result.version).toBe(1);
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
      const testData = new ChromeStorageData({
        display: {
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

      mockChrome.storage.sync.set.and.callFake((_data: any, callback: any) => {
        callback();
      });

      await service.setStorageData(testData);

      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith(testData, jasmine.any(Function));
    });

    it('should handle storage errors when saving', async () => {
      const testData = new ChromeStorageData({
        display: {
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

  describe('resetOptionsToDefaults', () => {
    it('should reset options to defaults while preserving history', async () => {
      const currentData: IChromeStorageData = {
        display: {
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
      spyOn(service, 'getStorageData').and.returnValue(Promise.resolve(currentData));
      spyOn(service, 'setStorageData').and.returnValue(Promise.resolve());

      await service.resetOptionsToDefaults();

      expect(service.getStorageData).toHaveBeenCalled();
      expect(service.setStorageData).toHaveBeenCalled();

      // Verify the reset data preserves history but resets other options
      const resetCall = (service.setStorageData as jasmine.Spy).calls.mostRecent();
      const resetData = resetCall.args[0];

      // History should be preserved
      expect(resetData.behaviour.galleryHistory).toEqual(currentData.behaviour.galleryHistory);

      // Other options should be reset to defaults
      const defaults = new ChromeStorageData();
      expect(resetData.display.darkMode).toBe(defaults.display.darkMode);
      expect(resetData.display.imageDisplayMode).toBe(defaults.display.imageDisplayMode);
      expect(resetData.behaviour.openInForeground).toBe(defaults.behaviour.openInForeground);
      expect(resetData.safety.enableOverloadProtection).toBe(defaults.safety.enableOverloadProtection);
      expect(resetData.safety.overloadProtectionLimit).toBe(defaults.safety.overloadProtectionLimit);
    });

    it('should handle errors during reset', async () => {
      spyOn(service, 'getStorageData').and.returnValue(Promise.reject(new Error('Storage error')));

      await expectAsync(service.resetOptionsToDefaults()).toBeRejected();
    });
  });
});
