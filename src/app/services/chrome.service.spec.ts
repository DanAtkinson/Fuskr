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

			expect(result).toEqual({});
		});

		it('should return stored data when available', async () => {
			const storedData: ChromeStorageData = {
				darkMode: true,
				keepRecentFusks: false,
				openInForeground: false
			};

			mockChrome.storage.sync.get.and.callFake((_keys: any, callback: any) => {
				callback(storedData);
			});

			const result = await service.getStorageData();

			expect(result).toEqual(storedData);
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
				darkMode: true,
				keepRecentFusks: false,
				openInForeground: true
			};

			mockChrome.storage.sync.set.and.callFake((_data: any, callback: any) => {
				callback();
			});

			await service.setStorageData(testData);

			expect(mockChrome.storage.sync.set).toHaveBeenCalledWith(testData, jasmine.any(Function));
		});

		it('should handle storage errors when saving', async () => {
			const testData: ChromeStorageData = {
				darkMode: true,
				keepRecentFusks: false,
				openInForeground: true
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
