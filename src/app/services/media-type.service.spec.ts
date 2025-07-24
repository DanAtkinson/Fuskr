import { TestBed } from '@angular/core/testing';
import { MediaTypeService } from './media-type.service';
import { LoggerService } from './logger.service';
import { MediaItem, MediaTypeResult } from '../models/media-item.interface';

describe('MediaTypeService', () => {
	let service: MediaTypeService;
	let mockLoggerService: jasmine.SpyObj<LoggerService>;
	let originalFetch: typeof fetch;

	beforeEach(() => {
		const loggerSpy = jasmine.createSpyObj('LoggerService', ['info', 'warn', 'error', 'debug']);

		TestBed.configureTestingModule({
			providers: [
				MediaTypeService,
				{ provide: LoggerService, useValue: loggerSpy }
			]
		});

		service = TestBed.inject(MediaTypeService);
		mockLoggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;

		// Store original fetch to restore later
		originalFetch = window.fetch;
	});

	afterEach(() => {
		// Restore original fetch
		window.fetch = originalFetch;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('createMediaItem', () => {
		it('should create MediaItem with correct initial values', () => {
			const url = 'https://example.com/image.jpg';
			const mediaItem = service.createMediaItem(url);

			expect(mediaItem.url).toBe(url);
			expect(mediaItem.type).toBe('unknown');
			expect(mediaItem.mimeType).toBe('application/octet-stream');
			expect(mediaItem.loadingState).toBe('pending');
			expect(mediaItem.extension).toBe('jpg');
		});

		it('should handle URLs without extensions', () => {
			const url = 'https://example.com/no-extension';
			const mediaItem = service.createMediaItem(url);

			expect(mediaItem.extension).toBeUndefined();
		});
	});

	describe('determineMediaType', () => {
		it('should determine image type from Content-Type header', async () => {
			const mockResponse = {
				ok: true,
				headers: {
					get: jasmine.createSpy('get').and.callFake((header: string) => {
						if (header === 'Content-Type') return 'image/jpeg';
						if (header === 'Content-Length') return '12345';
						return null;
					})
				}
			} as any;

			window.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(mockResponse));

			const result = await service.determineMediaType('https://example.com/image.jpg');

			expect(result.type).toBe('image');
			expect(result.mimeType).toBe('image/jpeg');
			expect(result.contentLength).toBe(12345);
		});

		it('should determine video type from Content-Type header', async () => {
			const mockResponse = {
				ok: true,
				headers: {
					get: jasmine.createSpy('get').and.callFake((header: string) => {
						if (header === 'Content-Type') return 'video/mp4';
						if (header === 'Content-Length') return '54321';
						return null;
					})
				}
			} as any;

			window.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(mockResponse));

			const result = await service.determineMediaType('https://example.com/video.mp4');

			expect(result.type).toBe('video');
			expect(result.mimeType).toBe('video/mp4');
			expect(result.contentLength).toBe(54321);
		});

		it('should fallback to URL extension detection when fetch fails', async () => {
			window.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.reject(new Error('Network error')));

			const result = await service.determineMediaType('https://example.com/video.webm');

			expect(result.type).toBe('video');
			expect(result.mimeType).toBe('video/webm');
			expect(mockLoggerService.warn).toHaveBeenCalled();
		});

		it('should use HEAD request with correct options', async () => {
			const mockResponse = {
				ok: true,
				headers: {
					get: jasmine.createSpy('get').and.returnValue('image/png')
				}
			} as any;

			window.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(mockResponse));

			await service.determineMediaType('https://example.com/image.png');

			expect(window.fetch).toHaveBeenCalledWith('https://example.com/image.png', {
				method: 'HEAD',
				cache: 'force-cache'
			});
		});
	});

	describe('updateMediaItemType', () => {
		it('should update MediaItem with successful result', async () => {
			const mockMediaItem: MediaItem = {
				url: 'https://example.com/image.jpg',
				type: 'unknown',
				mimeType: 'application/octet-stream',
				loadingState: 'pending',
				extension: 'jpg'
			};

			const mockResponse = {
				ok: true,
				headers: {
					get: jasmine.createSpy('get').and.callFake((header: string) => {
						if (header === 'Content-Type') return 'image/jpeg';
						return null;
					})
				}
			} as any;

			window.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(mockResponse));

			const result = await service.updateMediaItemType(mockMediaItem);

			expect(result.type).toBe('image');
			expect(result.mimeType).toBe('image/jpeg');
			expect(result.loadingState).toBe('loaded');
			expect(result.loadedAt).toBeInstanceOf(Date);
		});

		it('should handle errors gracefully with fallback to extension detection', async () => {
			const mockMediaItem: MediaItem = {
				url: 'https://example.com/broken.jpg',
				type: 'unknown',
				mimeType: 'application/octet-stream',
				loadingState: 'pending',
				extension: 'jpg'
			};

			window.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.reject(new Error('Network error')));

			const result = await service.updateMediaItemType(mockMediaItem);

			// Should fallback to extension-based detection instead of erroring
			expect(result.loadingState).toBe('loaded');
			expect(result.type).toBe('image');
			expect(result.mimeType).toBe('image/jpeg');
		});
	});

	describe('batchDetermineMediaTypes', () => {
		it('should process URLs in batches', async () => {
			const urls = ['https://example.com/1.jpg', 'https://example.com/2.mp4', 'https://example.com/3.png'];

			const mockResponse = {
				ok: true,
				headers: {
					get: jasmine.createSpy('get').and.returnValue('image/jpeg')
				}
			} as any;

			window.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(mockResponse));

			const results = await service.batchDetermineMediaTypes(urls, 2);

			expect(results).toHaveSize(3);
			expect(results.every(item => item.loadingState === 'loaded')).toBe(true);
			expect(mockLoggerService.debug).toHaveBeenCalled();
		});

		it('should handle batch processing errors with fallback to extension detection', async () => {
			const urls = ['https://example.com/1.jpg', 'https://example.com/2.mp4'];

			window.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.reject(new Error('Network error')));

			const results = await service.batchDetermineMediaTypes(urls, 5);

			expect(results).toHaveSize(2);
			// Should fallback to extension-based detection instead of erroring
			expect(results.every(item => item.loadingState === 'loaded')).toBe(true);
			expect(results[0].type).toBe('image');
			expect(results[1].type).toBe('video');
		});

		it('should handle errors when HTTP fails and no extension available', async () => {
			const mockMediaItem: MediaItem = {
				url: 'https://example.com/no-extension',
				type: 'unknown',
				mimeType: 'application/octet-stream',
				loadingState: 'pending',
				extension: undefined
			};

			window.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.reject(new Error('Network error')));

			const result = await service.updateMediaItemType(mockMediaItem);

			// Should still be loaded with fallback type detection
			expect(result.loadingState).toBe('loaded');
			expect(result.type).toBe('unknown');
			expect(result.mimeType).toBe('application/octet-stream');
		});
	});

	describe('Fallback Detection', () => {
		it('should detect image types from extensions', () => {
			const result = service['fallbackTypeDetection']('https://example.com/image.png');
			expect(result.type).toBe('image');
			expect(result.mimeType).toBe('image/png');
		});

		it('should detect video types from extensions', () => {
			const result = service['fallbackTypeDetection']('https://example.com/video.mp4');
			expect(result.type).toBe('video');
			expect(result.mimeType).toBe('video/mp4');
		});

		it('should return unknown for unrecognized extensions', () => {
			const result = service['fallbackTypeDetection']('https://example.com/document.pdf');
			expect(result.type).toBe('unknown');
			expect(result.mimeType).toBe('application/octet-stream');
		});

		it('should handle URLs without extensions', () => {
			const result = service['fallbackTypeDetection']('https://example.com/no-extension');
			expect(result.type).toBe('unknown');
			expect(result.mimeType).toBe('application/octet-stream');
		});
	});

	describe('MIME Type Detection', () => {
		it('should detect image MIME types', () => {
			expect(service['getTypeFromMimeType']('image/jpeg')).toBe('image');
			expect(service['getTypeFromMimeType']('image/png')).toBe('image');
			expect(service['getTypeFromMimeType']('image/gif; charset=utf-8')).toBe('image');
		});

		it('should detect video MIME types', () => {
			expect(service['getTypeFromMimeType']('video/mp4')).toBe('video');
			expect(service['getTypeFromMimeType']('video/webm')).toBe('video');
			expect(service['getTypeFromMimeType']('application/mp4')).toBe('video');
		});

		it('should return unknown for unrecognized MIME types', () => {
			expect(service['getTypeFromMimeType']('text/plain')).toBe('unknown');
			expect(service['getTypeFromMimeType']('application/pdf')).toBe('unknown');
		});

		it('should handle MIME types with parameters', () => {
			expect(service['getTypeFromMimeType']('image/jpeg; quality=0.8')).toBe('image');
		});
	});
});
