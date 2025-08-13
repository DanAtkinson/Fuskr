import { TestBed } from '@angular/core/testing';
import { FuskrService } from './fuskr.service';

// Type-only import for VS Code IntelliSense - won't be included in runtime bundle
import type {} from 'jasmine';

describe('FuskrService', () => {
	let service: FuskrService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(FuskrService);
	});

	describe('Service Creation', () => {
		it('should be created', () => {
			expect(service).toBeTruthy();
		});
	});

	describe('isFuskable Method', () => {
		it('should return false for null or undefined URLs', () => {
			expect(service.isFuskable(null as unknown as string)).toBeFalsy();
			expect(service.isFuskable(undefined as unknown as string)).toBeFalsy();
		});

		it('should return false for empty string URLs', () => {
			expect(service.isFuskable('')).toBeFalsy();
		});

		it('should return false for URLs with no fuskable patterns', () => {
			expect(service.isFuskable('http://domain.com/path/file/')).toBeFalsy();
		});

		it('should return false for unclosed bracket patterns', () => {
			expect(service.isFuskable('http://domain.com/path/file/[0-9.jpg')).toBeFalsy();
			expect(service.isFuskable('http://domain.com/path/file/[a-z.jpg')).toBeFalsy();
		});

		it('should return false for unopened bracket patterns', () => {
			expect(service.isFuskable('http://domain.com/path/file/0-9].jpg')).toBeFalsy();
			expect(service.isFuskable('http://domain.com/path/file/a-z].jpg')).toBeFalsy();
		});

		it('should return false for malformed patterns', () => {
			expect(service.isFuskable('http://domain.com/path/file/[0-45[.jpg')).toBeFalsy();
			expect(service.isFuskable('http://domain.com/path/file/[a-z[.jpg')).toBeFalsy();
		});

		it('should return true for basic fuskable patterns in filename', () => {
			expect(service.isFuskable('http://domain.com/path/file/[0-9].jpg')).toBeTruthy();
			expect(service.isFuskable('http://domain.com/path/file/[a-z].jpg')).toBeTruthy();
		});

		it('should return true for fuskable patterns in path', () => {
			expect(service.isFuskable('http://domain.com/path[0-9]/file.jpg')).toBeTruthy();
			expect(service.isFuskable('http://domain.com/path[a-z]/file.jpg')).toBeTruthy();
		});

		it('should return true for fuskable patterns with no file extension', () => {
			expect(service.isFuskable('http://domain.com/path[0-9]/')).toBeTruthy();
			expect(service.isFuskable('http://domain.com/path[a-z]/')).toBeTruthy();
			expect(service.isFuskable('http://domain.com/path[0-9]')).toBeTruthy();
			expect(service.isFuskable('http://domain.com/path[a-z]')).toBeTruthy();
		});

		it('should return true for fuskable patterns in domain', () => {
			expect(service.isFuskable('http://domain[0-9].com/path/file.jpg')).toBeTruthy();
			expect(service.isFuskable('http://domain[a-z].com/path/file.jpg')).toBeTruthy();
			expect(service.isFuskable('http://domain[0-9].com/path')).toBeTruthy();
			expect(service.isFuskable('http://domain[a-z].com/path')).toBeTruthy();
		});

		it('should return true for multiple fusk patterns', () => {
			expect(service.isFuskable('http://domain.com/path/file[0-9]another[0-9].jpg')).toBeTruthy();
			expect(service.isFuskable('http://domain.com/path/file[a-z]another[a-z].jpg')).toBeTruthy();
			expect(service.isFuskable('http://domain.com/path[0-9]another[0-9]/file.jpg')).toBeTruthy();
			expect(service.isFuskable('http://domain.com/path[a-z]another[a-z]/file.jpg')).toBeTruthy();
		});
	});

	describe('isNumeric and isAlphabetical Methods', () => {
		it('should detect numeric fuskable URLs', () => {
			expect(service.isNumeric('test[01-10].jpg')).toBeTruthy();
			expect(service.isNumeric('test.jpg')).toBeFalsy();
		});

		it('should detect alphabetic fuskable URLs', () => {
			expect(service.isAlphabetical('test[a-z].jpg')).toBeTruthy();
			expect(service.isAlphabetical('test.jpg')).toBeFalsy();
		});
	});

	describe('getLinks Method', () => {
		it('should return empty array for null or invalid URLs', () => {
			expect(service.getLinks(null as unknown as string)).toEqual([]);
			expect(service.getLinks(undefined as unknown as string)).toEqual([]);
			expect(service.getLinks('')).toEqual([]);
			expect(service.getLinks({ hey: 'ho' } as unknown as string)).toEqual([]);
			expect(service.getLinks(['string', 1234] as unknown as string)).toEqual([]);
		});

		it('should return empty array for unfuskable URLs', () => {
			expect(service.getLinks('http://domain.com/path/file/')).toEqual([]);
		});

		it('should generate URLs from basic numerical patterns [0-9]', () => {
			const urls = service.getLinks('http://domain.com/path/file/[0-9].jpg');
			expect(urls.length).toBe(10);
			expect(urls[0]).toBe('http://domain.com/path/file/0.jpg');
			expect(urls[9]).toBe('http://domain.com/path/file/9.jpg');
		});

		it('should generate URLs from basic alphabetical patterns [a-z]', () => {
			const urls = service.getLinks('http://domain.com/path/file/[a-z].jpg');
			expect(urls.length).toBe(26);
			expect(urls[0]).toBe('http://domain.com/path/file/a.jpg');
			expect(urls[25]).toBe('http://domain.com/path/file/z.jpg');
		});

		it('should generate URLs from specific numerical ranges', () => {
			const urls = service.getLinks('http://domain.com/path/file/[8-16].jpg');
			expect(urls.length).toBe(9);
			expect(urls[0]).toBe('http://domain.com/path/file/8.jpg');
			expect(urls[8]).toBe('http://domain.com/path/file/16.jpg');
		});

		it('should generate URLs from specific alphabetical ranges', () => {
			const urls = service.getLinks('http://domain.com/path/file/[h-p].jpg');
			expect(urls.length).toBe(9);
			expect(urls[0]).toBe('http://domain.com/path/file/h.jpg');
			expect(urls[8]).toBe('http://domain.com/path/file/p.jpg');
		});

		it('should handle zero-padded numerical patterns', () => {
			const urls = service.getLinks('http://domain.com/path/file/[08-16].jpg');
			expect(urls.length).toBe(9);
			expect(urls[0]).toBe('http://domain.com/path/file/08.jpg');
			expect(urls[8]).toBe('http://domain.com/path/file/16.jpg');
		});

		it('should generate URLs from multiple bracket patterns', () => {
			const urls = service.getLinks('http://domain.com/path/file/[0-9][3-7].jpg');
			expect(urls.length).toBe(50); // 10 * 5
			expect(urls).toContain('http://domain.com/path/file/03.jpg');
			expect(urls).toContain('http://domain.com/path/file/97.jpg');
		});

		it('should handle brace patterns with brackets', () => {
			const urls = service.getLinks('http://domain.com/path/file/[0-9]{0}.jpg');
			expect(urls.length).toBe(10);
			expect(urls).toContain('http://domain.com/path/file/00.jpg');
			expect(urls).toContain('http://domain.com/path/file/99.jpg');
		});
	});

	describe('createFuskUrl Method', () => {
		it('should create fusk URL from regular URL', () => {
			const fuskUrl = service.createFuskUrl('http://example.com/test05.jpg', 2, 0);
			expect(fuskUrl).toBe('http://example.com/test[03-07].jpg');
		});

		it('should handle different padding and offsets', () => {
			const fuskUrl = service.createFuskUrl('http://example.com/test005.jpg', 3, 1);
			expect(fuskUrl).toBe('http://example.com/test[005-008].jpg');
		});
	});

	describe('generateImageGallery Method', () => {
		it('should generate gallery from regular URL with default count', () => {
			const result = service.generateImageGallery('http://example.com/test05.jpg');
			expect(result.originalUrl).toBe('http://example.com/test[00-15].jpg');
			expect(result.urls.length).toBe(16);
			expect(result.urls).toContain('http://example.com/test05.jpg');
		});

		it('should generate gallery from regular URL with custom count', () => {
			const result = service.generateImageGallery('http://example.com/test05.jpg', 3);
			expect(result.originalUrl).toBe('http://example.com/test[02-08].jpg');
			expect(result.urls.length).toBe(7);
			expect(result.urls).toContain('http://example.com/test05.jpg');
		});

		it('should handle URLs that already have brackets', () => {
			const result = service.generateImageGallery('http://example.com/test[01-05].jpg');
			expect(result.originalUrl).toBe('http://example.com/test[01-05].jpg');
			expect(result.urls.length).toBe(5);
		});

		it('should generate alphabetic URLs', () => {
			const urls = service.getLinks('http://example.com/test[a-c].jpg');
			expect(urls.length).toBe(3);
			expect(urls[0]).toBe('http://example.com/testa.jpg');
			expect(urls[1]).toBe('http://example.com/testb.jpg');
			expect(urls[2]).toBe('http://example.com/testc.jpg');
		});
	});

	describe('getImageFilename Method', () => {
		it('should extract filename from URL', () => {
			const filename = service.getImageFilename('http://example.com/path/image.jpg');
			expect(filename).toBe('image.jpg');
		});

		it('should handle URLs without paths', () => {
			const filename = service.getImageFilename('http://example.com/image.jpg');
			expect(filename).toBe('image.jpg');
		});

		it('should handle URLs with query parameters', () => {
			const filename = service.getImageFilename('http://example.com/path/image.jpg?v=1');
			expect(filename).toBe('image.jpg?v=1');
		});
	});
});
