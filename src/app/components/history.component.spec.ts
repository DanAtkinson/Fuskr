import { beforeEach, describe, expect, it, vi, type Mock, type MockedObject } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HistoryComponent } from './history.component';
import { ChromeService } from '@services/chrome.service';
import { LoggerService } from '@services/logger.service';
import { GalleryHistory, GalleryHistoryEntry } from '@interfaces/gallery-history';

describe('HistoryComponent', () => {
	let component: HistoryComponent;
	let fixture: ComponentFixture<HistoryComponent>;
	let mockChromeService: MockedObject<ChromeService>;
	let mockLoggerService: MockedObject<LoggerService>;
	let mockRouter: MockedObject<Router>;

	const mockHistoryEntry: GalleryHistoryEntry = {
		id: 'test-id-1',
		originalUrl: 'https://example.com/image[001-005].jpg',
		timestamp: new Date('2025-07-21T01:00:00.000Z'),
		totalImages: 5,
		loadedImages: 4,
		brokenImages: 1,
		imageUrls: ['https://example.com/image001.jpg', 'https://example.com/image002.jpg', 'https://example.com/image003.jpg', 'https://example.com/image004.jpg', 'https://example.com/image005.jpg'],
		displayMode: 'fitOnPage',
	};

	const mockHistory: GalleryHistory = {
		entries: [mockHistoryEntry],
		maxEntries: 10,
	};

	const mockChromeStorageData = {
		display: { darkMode: false, autoRemoveBrokenImages: false, imageDisplayMode: 'fitOnPage', toggleBrokenImages: false },
		logging: { enabled: false, logLevel: 3 },
		safety: { enableOverloadProtection: true, overloadProtectionLimit: 50 },
		behaviour: { openInTab: false },
	};

	beforeEach(async () => {
		const chromeServiceSpy = {
			getGalleryHistory: vi.fn().mockName('ChromeService.getGalleryHistory'),
			clearGalleryHistory: vi.fn().mockName('ChromeService.clearGalleryHistory'),
			removeGalleryFromHistory: vi.fn().mockName('ChromeService.removeGalleryFromHistory'),
			updateDisplaySettings: vi.fn().mockName('ChromeService.updateDisplaySettings'),
			getStorageData: vi.fn().mockName('ChromeService.getStorageData'),
			isExtensionContext: vi.fn().mockName('ChromeService.isExtensionContext'),
			openTab: vi.fn().mockName('ChromeService.openTab'),
			getMessage: vi.fn().mockName('ChromeService.getMessage'),
		};

		const loggerServiceSpy = {
			configure: vi.fn().mockName('LoggerService.configure'),
			loadLogsFromStorage: vi.fn().mockName('LoggerService.loadLogsFromStorage'),
			debug: vi.fn().mockName('LoggerService.debug'),
			error: vi.fn().mockName('LoggerService.error'),
			warn: vi.fn().mockName('LoggerService.warn'),
			info: vi.fn().mockName('LoggerService.info'),
		};

		const routerSpy = {
			navigate: vi.fn().mockName('Router.navigate'),
		};

		await TestBed.configureTestingModule({
			imports: [HistoryComponent],
			providers: [
				{ provide: ChromeService, useValue: chromeServiceSpy },
				{ provide: LoggerService, useValue: loggerServiceSpy },
				{ provide: Router, useValue: routerSpy },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(HistoryComponent);
		component = fixture.componentInstance;
		mockChromeService = TestBed.inject(ChromeService) as MockedObject<ChromeService>;
		mockLoggerService = TestBed.inject(LoggerService) as MockedObject<LoggerService>;
		mockRouter = TestBed.inject(Router) as MockedObject<Router>;
	});

	beforeEach(() => {
		// Setup default mock returns
		mockChromeService.getGalleryHistory.mockReturnValue(Promise.resolve(mockHistory));
		mockChromeService.getStorageData.mockReturnValue(Promise.resolve(mockChromeStorageData));
		mockChromeService.clearGalleryHistory.mockReturnValue(Promise.resolve());
		mockChromeService.removeGalleryFromHistory.mockReturnValue(Promise.resolve());
		mockChromeService.updateDisplaySettings.mockReturnValue(Promise.resolve());
		mockChromeService.isExtensionContext.mockReturnValue(false);
		mockChromeService.getMessage.mockReturnValue('Confirm clear all?');
		(mockLoggerService.loadLogsFromStorage as Mock).mockReturnValue(Promise.resolve());
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialise with default values', () => {
		expect(component.darkMode()).toBe(false);
		expect(component.loading()).toBe(true);
		expect(component.history().entries).toEqual([]);
		expect(component.history().maxEntries).toBe(10);
	});

	describe('ngOnInit', () => {
		it('should load history and settings', async () => {
			await component.ngOnInit();

			expect(mockChromeService.getGalleryHistory).toHaveBeenCalled();
			expect(mockChromeService.getStorageData).toHaveBeenCalled();
			expect(mockLoggerService.configure).toHaveBeenCalledWith({
				enabled: mockChromeStorageData.logging.enabled,
				logLevel: mockChromeStorageData.logging.logLevel,
			});
			expect(component.history()).toEqual(mockHistory);
			expect(component.loading()).toBe(false);
		});

		it('should handle history loading error', async () => {
			mockChromeService.getGalleryHistory.mockReturnValue(Promise.reject(new Error('Storage error')));

			await component.ngOnInit();

			expect(mockLoggerService.error).toHaveBeenCalledWith('history.loadFailed', 'Failed to load gallery history', expect.any(Error));
			expect(component.loading()).toBe(false);
		});
	});

	describe('formatDate', () => {
		it('should format valid Date object correctly', () => {
			const testDate = new Date('2025-07-21T14:30:45.000Z');
			const result = component.formatDate(testDate);

			expect(result).toContain('2025');
			expect(result).toContain(':'); // Time separator
		});

		it('should format valid ISO string correctly', () => {
			const result = component.formatDate('2025-07-21T14:30:45.000Z');

			expect(result).toContain('2025');
			expect(result).toContain(':'); // Time separator
		});

		it('should handle invalid date gracefully', () => {
			const result = component.formatDate('invalid-date');

			expect(result).toBe('Invalid Date');
			expect(mockLoggerService.warn).toHaveBeenCalledWith('history.formatDate', 'Invalid date provided', expect.any(Object));
		});

		it('should handle null/undefined input', () => {
			// null becomes epoch time (Jan 1, 1970) which is a valid date
			const result = component.formatDate(null as unknown as Date);
			expect(result).toContain('1970');

			// undefined should be invalid
			const undefinedResult = component.formatDate(undefined as unknown as Date);
			expect(undefinedResult).toBe('Invalid Date');
		});

		it('should handle edge case date formats', () => {
			const edgeCases = [
				'2023-13-01', // Invalid month
				'2023-01-32', // Invalid day
				'not-a-date',
				'',
				'   ', // Whitespace only
				'2023/01/01', // Different format (valid)
				'Jan 1, 2023', // Natural language (valid)
			];

			edgeCases.forEach((dateStr) => {
				const result = component.formatDate(dateStr);
				expect(typeof result).toBe('string');
				// Should either be valid formatted date or 'Invalid Date'
				expect(result === 'Invalid Date' || result.length > 0).toBe(true);
			});
		});

		it('should handle numeric timestamps', () => {
			const timestamp = 1640995200000; // January 1, 2022
			const result = component.formatDate(timestamp as unknown as Date);

			expect(result).not.toBe('Invalid Date');
			expect(result).toContain('2022');
		});

		it('should handle future and past dates', () => {
			const futureDate = new Date('2099-12-31T23:59:59.999Z');
			const pastDate = new Date('1900-01-01T00:00:00.000Z');

			const futureResult = component.formatDate(futureDate);
			const pastResult = component.formatDate(pastDate);

			expect(futureResult).not.toBe('Invalid Date');
			expect(pastResult).not.toBe('Invalid Date');
			expect(futureResult).toContain('2099');
			expect(pastResult).toContain('1900');
		});
	});

	describe('getFilename', () => {
		it('should extract filename from URL', () => {
			const result = component.getFilename('https://example.com/path/image.jpg');
			expect(result).toBe('image.jpg');
		});

		it('should extract filename from URL with query parameters', () => {
			const result = component.getFilename('https://example.com/path/image.jpg?param=value');
			expect(result).toBe('image.jpg');
		});

		it('should return gallery for URLs without filename', () => {
			const result = component.getFilename('https://example.com/path/');
			expect(result).toBe('gallery');
		});

		it('should handle invalid URLs', () => {
			const result = component.getFilename('invalid-url');
			expect(result).toBe('gallery');
		});

		it('should handle empty URLs', () => {
			const result = component.getFilename('');
			expect(result).toBe('gallery');
		});

		it('should handle URLs with no path', () => {
			const result = component.getFilename('https://example.com');
			expect(result).toBe('gallery');
		});

		it('should handle URLs with complex filenames', () => {
			const complexCases = [
				['https://example.com/image-with-dashes.jpg', 'image-with-dashes.jpg'],
				['https://example.com/image_with_underscores.png', 'image_with_underscores.png'],
				['https://example.com/image%20with%20spaces.gif', 'image%20with%20spaces.gif'],
				['https://example.com/image.jpeg?size=large&format=jpg', 'image.jpeg'],
				['https://example.com/folder/subfolder/deep-image.webp', 'deep-image.webp'],
			];

			complexCases.forEach(([url, expectedBase]) => {
				const result = component.getFilename(url);
				expect(result).toBe(expectedBase);
			});
		});

		it('should handle URLs with Unicode filenames', () => {
			// Unicode characters get URL-encoded automatically by the URL constructor
			const result = component.getFilename('https://example.com/файл.jpg');
			// The URL encoding of 'файл.jpg' is '%D1%84%D0%B0%D0%B9%D0%BB.jpg'
			expect(result).toBe('%D1%84%D0%B0%D0%B9%D0%BB.jpg');
		});

		it('should handle URLs with fragments', () => {
			const result = component.getFilename('https://example.com/image.jpg#section');
			expect(result).toBe('image.jpg');
		});

		it('should handle data URLs gracefully', () => {
			const result = component.getFilename('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
			// Data URLs will be parsed and the last part after '/' will be extracted
			expect(result.length).toBeGreaterThan(0);
			expect(typeof result).toBe('string');
		});

		it('should handle file URLs', () => {
			const result = component.getFilename('file:///C:/Users/test/image.jpg');
			expect(result).toBe('image.jpg');
		});
	});

	describe('getSuccessRate', () => {
		it('should calculate success rate correctly', () => {
			const entry = { ...mockHistoryEntry, totalImages: 10, loadedImages: 8 };
			const result = component.getSuccessRate(entry);
			expect(result).toBe(80);
		});

		it('should return 0 for entries with no total images', () => {
			const entry = { ...mockHistoryEntry, totalImages: 0, loadedImages: 0 };
			const result = component.getSuccessRate(entry);
			expect(result).toBe(0);
		});

		it('should handle 100% success rate', () => {
			const entry = { ...mockHistoryEntry, totalImages: 5, loadedImages: 5 };
			const result = component.getSuccessRate(entry);
			expect(result).toBe(100);
		});

		it('should handle fractional success rates', () => {
			const entry1 = { ...mockHistoryEntry, totalImages: 3, loadedImages: 1 };
			const result1 = component.getSuccessRate(entry1);
			expect(result1).toBe(33); // 33.33... rounded to 33

			const entry2 = { ...mockHistoryEntry, totalImages: 3, loadedImages: 2 };
			const result2 = component.getSuccessRate(entry2);
			expect(result2).toBe(67); // 66.66... rounded to 67
		});

		it('should handle edge case with loaded > total', () => {
			// Edge case that shouldn't happen but we should handle gracefully
			const entry = { ...mockHistoryEntry, totalImages: 5, loadedImages: 7 };
			const result = component.getSuccessRate(entry);
			expect(result).toBe(140); // 140% - over 100%
		});

		it('should handle large numbers', () => {
			const entry = { ...mockHistoryEntry, totalImages: 10000, loadedImages: 9999 };
			const result = component.getSuccessRate(entry);
			expect(result).toBe(100); // 99.99% rounded to 100%
		});

		it('should handle negative numbers gracefully', () => {
			const entry = { ...mockHistoryEntry, totalImages: -5, loadedImages: -3 };
			const result = component.getSuccessRate(entry);
			expect(result).toBe(60); // -3/-5 = 0.6 = 60%
		});
	});

	describe('getSuccessRateClass', () => {
		it('should return success for rates >= 80%', () => {
			expect(component.getSuccessRateClass(80)).toBe('success');
			expect(component.getSuccessRateClass(100)).toBe('success');
		});

		it('should return warning for rates between 50-79%', () => {
			expect(component.getSuccessRateClass(50)).toBe('warning');
			expect(component.getSuccessRateClass(79)).toBe('warning');
		});

		it('should return danger for rates < 50%', () => {
			expect(component.getSuccessRateClass(0)).toBe('danger');
			expect(component.getSuccessRateClass(49)).toBe('danger');
		});

		it('should handle exact boundary values', () => {
			expect(component.getSuccessRateClass(79.9)).toBe('warning');
			expect(component.getSuccessRateClass(80.0)).toBe('success');
			expect(component.getSuccessRateClass(49.9)).toBe('danger');
			expect(component.getSuccessRateClass(50.0)).toBe('warning');
		});

		it('should handle extreme values', () => {
			expect(component.getSuccessRateClass(999)).toBe('success');
			expect(component.getSuccessRateClass(-10)).toBe('danger');
			expect(component.getSuccessRateClass(0.1)).toBe('danger');
		});

		it('should handle NaN and undefined', () => {
			expect(component.getSuccessRateClass(NaN)).toBe('danger');
			expect(component.getSuccessRateClass(undefined as unknown as number)).toBe('danger');
		});
	});

	describe('openGallery', () => {
		it('should navigate to gallery with base64 encoded URL', () => {
			component.openGallery(mockHistoryEntry);

			const expectedEncodedUrl = btoa(mockHistoryEntry.originalUrl);
			expect(mockRouter.navigate).toHaveBeenCalledWith(['/gallery'], {
				queryParams: { url: expectedEncodedUrl },
			});
		});
	});

	describe('openGalleryInNewTab', () => {
		beforeEach(() => {
			// Simple approach - just assume current location properties will work
			// The actual openGalleryInNewTab method will use window.location.origin and pathname
		});

		it('should open tab via chrome service in extension context', async () => {
			mockChromeService.isExtensionContext.mockReturnValue(true);

			await component.openGalleryInNewTab(mockHistoryEntry);

			expect(mockChromeService.openTab).toHaveBeenCalledWith(expect.stringContaining('#/gallery?url='), true);
			expect(mockLoggerService.debug).toHaveBeenCalledWith('history.galleryOpened', expect.any(String));
		});

		it('should use window.open in non-extension context', async () => {
			mockChromeService.isExtensionContext.mockReturnValue(false);
			vi.spyOn(window, 'open');

			await component.openGalleryInNewTab(mockHistoryEntry);

			expect(window.open).toHaveBeenCalledWith(expect.stringContaining('#/gallery?url='), '_blank');
		});

		it('should handle errors when opening in new tab', async () => {
			mockChromeService.isExtensionContext.mockReturnValue(true);
			mockChromeService.openTab.mockReturnValue(Promise.reject(new Error('Tab error')));

			await component.openGalleryInNewTab(mockHistoryEntry);

			expect(mockLoggerService.error).toHaveBeenCalledWith('history.openTabFailed', 'Failed to open gallery in new tab', expect.any(Error));
		});
	});

	describe('removeEntry', () => {
		let mockEvent: MockedObject<Event>;

		beforeEach(() => {
			mockEvent = {
				stopPropagation: vi.fn().mockName('Event.stopPropagation'),
			};
			component.history.set({ ...mockHistory });
		});

		it('should remove entry and update local array', async () => {
			await component.removeEntry(mockHistoryEntry, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockChromeService.removeGalleryFromHistory).toHaveBeenCalledWith(mockHistoryEntry.id);
			expect(component.history().entries).toEqual([]);
			expect(mockLoggerService.debug).toHaveBeenCalledWith('history.entryRemoved', expect.stringContaining(mockHistoryEntry.id));
		});

		it('should handle removal errors', async () => {
			mockChromeService.removeGalleryFromHistory.mockReturnValue(Promise.reject(new Error('Remove error')));

			await component.removeEntry(mockHistoryEntry, mockEvent);

			expect(mockLoggerService.error).toHaveBeenCalledWith('history.removeFailed', 'Failed to remove history entry', expect.any(Error));
		});
	});

	describe('clearAllHistory', () => {
		beforeEach(() => {
			vi.spyOn(window, 'confirm');
			component.history.set({ ...mockHistory });
		});

		it('should clear history when confirmed', async () => {
			(window.confirm as Mock).mockReturnValue(true);

			await component.clearAllHistory();

			expect(mockChromeService.clearGalleryHistory).toHaveBeenCalled();
			expect(component.history().entries).toEqual([]);
			expect(mockLoggerService.debug).toHaveBeenCalledWith('history.cleared', 'All history cleared');
		});

		it('should not clear history when cancelled', async () => {
			(window.confirm as Mock).mockReturnValue(false);

			await component.clearAllHistory();

			expect(mockChromeService.clearGalleryHistory).not.toHaveBeenCalled();
			expect(component.history().entries).toEqual(mockHistory.entries);
		});

		it('should handle clear errors', async () => {
			(window.confirm as Mock).mockReturnValue(true);
			mockChromeService.clearGalleryHistory.mockReturnValue(Promise.reject(new Error('Clear error')));

			await component.clearAllHistory();

			expect(mockLoggerService.error).toHaveBeenCalledWith('history.clearFailed', 'Failed to clear history', expect.any(Error));
		});
	});

	describe('toggleDarkMode', () => {
		it('should toggle dark mode and update settings', async () => {
			component.darkMode.set(false);

			await component.toggleDarkMode();

			expect(component.darkMode()).toBe(true);
			expect(mockChromeService.updateDisplaySettings).toHaveBeenCalledWith({ darkMode: true });
		});
	});
});
