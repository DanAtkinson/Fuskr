import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HistoryComponent } from './history.component';
import { ChromeService } from '@services/chrome.service';
import { LoggerService } from '@services/logger.service';
import { GalleryHistory, GalleryHistoryEntry } from '@interfaces/gallery-history';

describe('HistoryComponent', () => {
	let component: HistoryComponent;
	let fixture: ComponentFixture<HistoryComponent>;
	let mockChromeService: jasmine.SpyObj<ChromeService>;
	let mockLoggerService: jasmine.SpyObj<LoggerService>;
	let mockRouter: jasmine.SpyObj<Router>;

	const mockHistoryEntry: GalleryHistoryEntry = {
		id: 'test-id-1',
		originalUrl: 'https://example.com/image[001-005].jpg',
		timestamp: new Date('2025-07-21T01:00:00.000Z'),
		totalImages: 5,
		loadedImages: 4,
		brokenImages: 1,
		imageUrls: [
			'https://example.com/image001.jpg',
			'https://example.com/image002.jpg',
			'https://example.com/image003.jpg',
			'https://example.com/image004.jpg',
			'https://example.com/image005.jpg'
		],
		displayMode: 'fitOnPage'
	};

	const mockHistory: GalleryHistory = {
		entries: [mockHistoryEntry],
		maxEntries: 10
	};

	beforeEach(async () => {
		const chromeServiceSpy = jasmine.createSpyObj('ChromeService', [
			'getGalleryHistory',
			'clearGalleryHistory',
			'removeGalleryFromHistory',
			'updateDisplaySettings',
			'getDarkMode',
			'isExtensionContext',
			'openTab',
			'getMessage'
		]);

		const loggerServiceSpy = jasmine.createSpyObj('LoggerService', [
			'debug',
			'error',
			'warn',
			'info'
		]);

		const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

		await TestBed.configureTestingModule({
			declarations: [HistoryComponent],
			providers: [
				{ provide: ChromeService, useValue: chromeServiceSpy },
				{ provide: LoggerService, useValue: loggerServiceSpy },
				{ provide: Router, useValue: routerSpy }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(HistoryComponent);
		component = fixture.componentInstance;
		mockChromeService = TestBed.inject(ChromeService) as jasmine.SpyObj<ChromeService>;
		mockLoggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
		mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
	});

	beforeEach(() => {
		// Setup default mock returns
		mockChromeService.getGalleryHistory.and.returnValue(Promise.resolve(mockHistory));
		mockChromeService.getDarkMode.and.returnValue(Promise.resolve(false));
		mockChromeService.clearGalleryHistory.and.returnValue(Promise.resolve());
		mockChromeService.removeGalleryFromHistory.and.returnValue(Promise.resolve());
		mockChromeService.updateDisplaySettings.and.returnValue(Promise.resolve());
		mockChromeService.isExtensionContext.and.returnValue(false);
		mockChromeService.getMessage.and.returnValue('Confirm clear all?');
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialise with default values', () => {
		expect(component.darkMode).toBe(false);
		expect(component.loading).toBe(true);
		expect(component.history.entries).toEqual([]);
		expect(component.history.maxEntries).toBe(10);
	});

	describe('ngOnInit', () => {
		it('should load history and settings', async () => {
			await component.ngOnInit();

			expect(mockChromeService.getGalleryHistory).toHaveBeenCalled();
			expect(mockChromeService.getDarkMode).toHaveBeenCalled();
			expect(component.history).toEqual(mockHistory);
			expect(component.loading).toBe(false);
		});

		it('should handle history loading error', async () => {
			mockChromeService.getGalleryHistory.and.returnValue(Promise.reject(new Error('Storage error')));

			await component.ngOnInit();

			expect(mockLoggerService.error).toHaveBeenCalledWith('history.loadFailed', 'Failed to load gallery history', jasmine.any(Error));
			expect(component.loading).toBe(false);
		});
	});

	describe('formatDate', () => {
		it('should format valid Date object correctly', () => {
			const testDate = new Date('2025-07-21T14:30:45.000Z');
			const result = component.formatDate(testDate);

			expect(result).toContain('7/21/2025'); // US Date format (MM/DD/YYYY)
			expect(result).toContain(':'); // Time separator
		});

		it('should format valid ISO string correctly', () => {
			const result = component.formatDate('2025-07-21T14:30:45.000Z');

			expect(result).toContain('7/21/2025'); // US Date format (MM/DD/YYYY)
			expect(result).toContain(':'); // Time separator
		});

		it('should handle invalid date gracefully', () => {
			const result = component.formatDate('invalid-date');

			expect(result).toBe('Invalid Date');
			expect(mockLoggerService.warn).toHaveBeenCalledWith('history.formatDate', 'Invalid date provided', jasmine.any(Object));
		});

		it('should handle null/undefined input', () => {
			// null becomes epoch time (Jan 1, 1970) which is a valid date
			const result = component.formatDate(null as any);
			expect(result).toContain('1/1/1970'); // US format for epoch

			// undefined should be invalid
			const undefinedResult = component.formatDate(undefined as any);
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
				'Jan 1, 2023' // Natural language (valid)
			];

			edgeCases.forEach(dateStr => {
				const result = component.formatDate(dateStr);
				expect(typeof result).toBe('string');
				// Should either be valid formatted date or 'Invalid Date'
				expect(result === 'Invalid Date' || result.length > 0).toBe(true);
			});
		});

		it('should handle numeric timestamps', () => {
			const timestamp = 1640995200000; // January 1, 2022
			const result = component.formatDate(timestamp as any);

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
				['https://example.com/folder/subfolder/deep-image.webp', 'deep-image.webp']
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
			expect(component.getSuccessRateClass(undefined as any)).toBe('danger');
		});
	});

	describe('openGallery', () => {
		it('should navigate to gallery with encoded URL', () => {
			component.openGallery(mockHistoryEntry);

			expect(mockRouter.navigate).toHaveBeenCalledWith(
				['/gallery'],
				{ queryParams: { url: encodeURIComponent(mockHistoryEntry.originalUrl) } }
			);
		});
	});

	describe('openGalleryInNewTab', () => {
		beforeEach(() => {
			// Simple approach - just assume current location properties will work
			// The actual openGalleryInNewTab method will use window.location.origin and pathname
		});

		it('should open tab via chrome service in extension context', async () => {
			mockChromeService.isExtensionContext.and.returnValue(true);

			await component.openGalleryInNewTab(mockHistoryEntry);

			expect(mockChromeService.openTab).toHaveBeenCalledWith(
				jasmine.stringContaining('#/gallery?url='),
				true
			);
			expect(mockLoggerService.debug).toHaveBeenCalledWith('history.galleryOpened', jasmine.any(String));
		});

		it('should use window.open in non-extension context', async () => {
			mockChromeService.isExtensionContext.and.returnValue(false);
			spyOn(window, 'open');

			await component.openGalleryInNewTab(mockHistoryEntry);

			expect(window.open).toHaveBeenCalledWith(jasmine.stringContaining('#/gallery?url='), '_blank');
		});

		it('should handle errors when opening in new tab', async () => {
			mockChromeService.isExtensionContext.and.returnValue(true);
			mockChromeService.openTab.and.returnValue(Promise.reject(new Error('Tab error')));

			await component.openGalleryInNewTab(mockHistoryEntry);

			expect(mockLoggerService.error).toHaveBeenCalledWith('history.openTabFailed', 'Failed to open gallery in new tab', jasmine.any(Error));
		});
	});

	describe('removeEntry', () => {
		let mockEvent: jasmine.SpyObj<Event>;

		beforeEach(() => {
			mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
			component.history = { ...mockHistory };
		});

		it('should remove entry and update local array', async () => {
			await component.removeEntry(mockHistoryEntry, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockChromeService.removeGalleryFromHistory).toHaveBeenCalledWith(mockHistoryEntry.id);
			expect(component.history.entries).toEqual([]);
			expect(mockLoggerService.debug).toHaveBeenCalledWith('history.entryRemoved', jasmine.stringContaining(mockHistoryEntry.id));
		});

		it('should handle removal errors', async () => {
			mockChromeService.removeGalleryFromHistory.and.returnValue(Promise.reject(new Error('Remove error')));

			await component.removeEntry(mockHistoryEntry, mockEvent);

			expect(mockLoggerService.error).toHaveBeenCalledWith('history.removeFailed', 'Failed to remove history entry', jasmine.any(Error));
		});
	});

	describe('clearAllHistory', () => {
		beforeEach(() => {
			spyOn(window, 'confirm');
			component.history = { ...mockHistory };
		});

		it('should clear history when confirmed', async () => {
			(window.confirm as jasmine.Spy).and.returnValue(true);

			await component.clearAllHistory();

			expect(mockChromeService.clearGalleryHistory).toHaveBeenCalled();
			expect(component.history.entries).toEqual([]);
			expect(mockLoggerService.debug).toHaveBeenCalledWith('history.cleared', 'All history cleared');
		});

		it('should not clear history when cancelled', async () => {
			(window.confirm as jasmine.Spy).and.returnValue(false);

			await component.clearAllHistory();

			expect(mockChromeService.clearGalleryHistory).not.toHaveBeenCalled();
			expect(component.history.entries).toEqual(mockHistory.entries);
		});

		it('should handle clear errors', async () => {
			(window.confirm as jasmine.Spy).and.returnValue(true);
			mockChromeService.clearGalleryHistory.and.returnValue(Promise.reject(new Error('Clear error')));

			await component.clearAllHistory();

			expect(mockLoggerService.error).toHaveBeenCalledWith('history.clearFailed', 'Failed to clear history', jasmine.any(Error));
		});
	});

	describe('toggleDarkMode', () => {
		it('should toggle dark mode and update settings', async () => {
			component.darkMode = false;

			await component.toggleDarkMode();

			expect(component.darkMode).toBe(true);
			expect(mockChromeService.updateDisplaySettings).toHaveBeenCalledWith({ darkMode: true });
		});
	});
});
