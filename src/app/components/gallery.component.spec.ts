import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { GalleryComponent } from './gallery.component';
import { FuskrService } from '@services/fuskr.service';
import { ChromeService } from '@services/chrome.service';
import { MediaTypeService } from '@services/media-type.service';
import { BaseComponentTestHelper } from './base-component-test.helper';
import { MediaItem } from '@interfaces/media';

// Type-only import for VS Code IntelliSense - won't be included in runtime bundle
import type {} from 'jasmine';

describe('GalleryComponent', () => {
	let component: GalleryComponent;
	let fixture: ComponentFixture<GalleryComponent>;
	let mockFuskrService: jasmine.SpyObj<FuskrService>;
	let mockChromeService: jasmine.SpyObj<ChromeService>;
	let mockMediaTypeService: jasmine.SpyObj<MediaTypeService>;
	let mockRouter: jasmine.SpyObj<Router>;
	let mockActivatedRoute: Partial<ActivatedRoute>;

	beforeEach(async () => {
		mockFuskrService = jasmine.createSpyObj('FuskrService', [
			'generateImageGallery',
			'getImageFilename',
			'countPotentialUrls',
		]);
		mockMediaTypeService = jasmine.createSpyObj('MediaTypeService', [
			'batchDetermineMediaTypes',
			'createMediaItem',
			'fallbackTypeDetection',
			// Added for progressive detection path
			'determineMediaType',
		]);
		mockRouter = jasmine.createSpyObj('Router', ['navigate']);
		mockActivatedRoute = {
			queryParams: of({ url: 'https://example.com/test.jpg' }),
			snapshot: { queryParams: {} },
		} as unknown as ActivatedRoute;

		// Setup the ChromeService mock using BaseComponentTestHelper
		mockChromeService = BaseComponentTestHelper.setupChromeServiceMock();

		await TestBed.configureTestingModule({
			imports: [GalleryComponent],
			providers: [
				{ provide: FuskrService, useValue: mockFuskrService },
				{ provide: ChromeService, useValue: mockChromeService },
				{ provide: MediaTypeService, useValue: mockMediaTypeService },
				{ provide: Router, useValue: mockRouter },
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(GalleryComponent);
		component = fixture.componentInstance;
	});

	describe('Component Initialisation', () => {
		it('should create', () => {
			expect(component).toBeTruthy();
		});

		it('should initialise with default values', () => {
			expect(component.originalUrl).toBe('');
			expect(component.imageUrls).toEqual([]);
			expect(component.loading).toBeFalsy();
		});
	});

	describe('Gallery Generation', () => {
		it('should generate gallery from URL', async () => {
			const mockResult = {
				originalUrl: 'https://example.com/image[01-10].jpg',
				urls: ['https://example.com/image01.jpg', 'https://example.com/image02.jpg'],
			};

			mockFuskrService.generateImageGallery.and.returnValue(mockResult);
			mockFuskrService.countPotentialUrls.and.returnValue(2); // Below limit
			mockMediaTypeService.createMediaItem.and.callFake((url: string) => ({
				url,
				type: 'unknown',
				mimeType: 'application/octet-stream',
				loadingState: 'pending',
				extension: url.split('.').pop()?.toLowerCase(),
			}));
			mockMediaTypeService.fallbackTypeDetection.and.callFake(
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				(_url: string) => ({
					type: 'image',
					mimeType: 'image/jpeg',
				})
			);

			component.originalUrl = 'https://example.com/image05.jpg';
			await component.generateGallery();

			expect(mockFuskrService.countPotentialUrls).toHaveBeenCalledWith('https://example.com/image05.jpg');
			expect(mockFuskrService.generateImageGallery).toHaveBeenCalledWith('https://example.com/image05.jpg');
			expect(mockMediaTypeService.createMediaItem).toHaveBeenCalledTimes(2);
			expect(mockMediaTypeService.fallbackTypeDetection).toHaveBeenCalledTimes(2);
			expect(component.imageUrls).toEqual(mockResult.urls);
			expect(component.mediaItems.length).toBe(2);
			expect(component.mediaItems[0].type).toBe('image');
			expect(component.originalUrl).toBe(mockResult.originalUrl);
		});

		it('should handle empty URL', () => {
			component.originalUrl = '';
			component.generateGallery();

			expect(component.errorMessage).toBe('Please enter a valid URL');
			expect(mockFuskrService.generateImageGallery).not.toHaveBeenCalled();
		});

		it('should trigger overload protection when URL count exceeds limit', () => {
			spyOn(window, 'confirm').and.returnValue(false); // User chooses not to proceed
			mockFuskrService.countPotentialUrls.and.returnValue(1000); // Above default limit of 500

			component.originalUrl = 'https://example.com/image[001-1000].jpg';
			component.enableOverloadProtection = true;
			component.overloadProtectionLimit = 500;
			component.generateGallery();

			expect(mockFuskrService.countPotentialUrls).toHaveBeenCalledWith('https://example.com/image[001-1000].jpg');
			expect(window.confirm).toHaveBeenCalled();
			expect(mockFuskrService.generateImageGallery).not.toHaveBeenCalled(); // Should not proceed
		});

		it('should proceed when user confirms overload protection warning', () => {
			const mockResult = {
				originalUrl: 'https://example.com/image[001-1000].jpg',
				urls: Array.from(
					{ length: 1000 },
					(_, i) => `https://example.com/image${String(i + 1).padStart(3, '0')}.jpg`
				),
			};

			spyOn(window, 'confirm').and.returnValue(true); // User chooses to proceed
			mockFuskrService.countPotentialUrls.and.returnValue(1000);
			mockFuskrService.generateImageGallery.and.returnValue(mockResult);

			component.originalUrl = 'https://example.com/image[001-1000].jpg';
			component.enableOverloadProtection = true;
			component.overloadProtectionLimit = 500;
			component.generateGallery();

			expect(mockFuskrService.countPotentialUrls).toHaveBeenCalledWith('https://example.com/image[001-1000].jpg');
			expect(window.confirm).toHaveBeenCalled();
			expect(mockFuskrService.generateImageGallery).toHaveBeenCalledWith(
				'https://example.com/image[001-1000].jpg'
			);
		});

		it('should bypass overload protection when disabled', () => {
			const mockResult = {
				originalUrl: 'https://example.com/image[001-1000].jpg',
				urls: Array.from(
					{ length: 1000 },
					(_, i) => `https://example.com/image${String(i + 1).padStart(3, '0')}.jpg`
				),
			};

			mockFuskrService.generateImageGallery.and.returnValue(mockResult);

			component.originalUrl = 'https://example.com/image[001-1000].jpg';
			component.enableOverloadProtection = false; // Disabled
			component.generateGallery();

			expect(mockFuskrService.countPotentialUrls).not.toHaveBeenCalled(); // Should skip count check
			expect(mockFuskrService.generateImageGallery).toHaveBeenCalledWith(
				'https://example.com/image[001-1000].jpg'
			);
		});

		it('should open image in browser for non-extension context', () => {
			const testUrl = 'https://example.com/test.jpg';
			mockChromeService.isExtensionContext.and.returnValue(false);
			spyOn(window, 'open');

			component.openImage(testUrl);

			expect(window.open).toHaveBeenCalledWith(testUrl, '_blank');
		});

		it('should open image in tab using openInTab method', () => {
			const testUrl = 'https://example.com/test.jpg';
			const mockEvent = new Event('click');
			spyOn(mockEvent, 'stopPropagation');
			spyOn(mockEvent, 'preventDefault');
			mockChromeService.isExtensionContext.and.returnValue(false);
			spyOn(window, 'open');

			component.openInTab(testUrl, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(window.open).toHaveBeenCalledWith(testUrl, '_blank');
		});

		it('should open image in tab using Chrome service for extension context', () => {
			const testUrl = 'https://example.com/test.jpg';
			const mockEvent = new Event('click');
			spyOn(mockEvent, 'stopPropagation');
			spyOn(mockEvent, 'preventDefault');
			mockChromeService.isExtensionContext.and.returnValue(true);

			component.openInTab(testUrl, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockChromeService.openTab).toHaveBeenCalledWith(testUrl);
		});

		it('should download single image', () => {
			const testUrl = 'https://example.com/test.jpg';
			const mockEvent = new Event('click');
			spyOn(mockEvent, 'stopPropagation');
			mockFuskrService.getImageFilename.and.returnValue('test.jpg');

			component.downloadImage(testUrl, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockChromeService.downloadFile).toHaveBeenCalledWith(testUrl, 'test.jpg');
		});

		it('should copy URL to clipboard', async () => {
			const testUrl = 'https://example.com/test.jpg';
			const mockEvent = new Event('click');
			spyOn(mockEvent, 'stopPropagation');
			spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
			spyOn(console, 'log');

			await component.copyUrl(testUrl, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testUrl);
		});
	});

	describe('Image Viewer', () => {
		beforeEach(() => {
			component.imageUrls = ['url1.jpg', 'url2.jpg', 'url3.jpg'];
			// Set up mediaItems to match imageUrls for navigation tests
			component.mediaItems = [
				{ url: 'url1.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url2.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url3.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
			];
			// Initialize brokenUrls as empty set using component accessor
			(component as unknown as { brokenUrls: Set<string> }).brokenUrls = new Set();
		});

		it('should open image viewer', () => {
			const testUrl = 'url2.jpg';
			const testIndex = 1;

			component.openImageViewer(testUrl, testIndex);

			expect(component.showImageViewer).toBe(true);
			expect(component.currentViewerImage).toBe(testUrl);
			expect(component.currentViewerIndex).toBe(testIndex);
		});

		it('should close image viewer', () => {
			component.showImageViewer = true;

			component.closeImageViewer();

			expect(component.showImageViewer).toBe(false);
		});

		it('should navigate to next image', () => {
			component.currentViewerIndex = 1;
			component.currentViewerImage = 'url2.jpg';

			component.nextImage();

			expect(component.currentViewerIndex).toBe(2);
			expect(component.currentViewerImage).toBe('url3.jpg');
		});

		it('should not navigate past last image', () => {
			component.currentViewerIndex = 2;
			component.currentViewerImage = 'url3.jpg';

			component.nextImage();

			expect(component.currentViewerIndex).toBe(2);
			expect(component.currentViewerImage).toBe('url3.jpg');
		});

		it('should navigate to previous image', () => {
			component.currentViewerIndex = 2;
			component.currentViewerImage = 'url3.jpg';

			component.previousImage();

			expect(component.currentViewerIndex).toBe(1);
			expect(component.currentViewerImage).toBe('url2.jpg');
		});

		it('should not navigate before first image', () => {
			component.currentViewerIndex = 0;
			component.currentViewerImage = 'url1.jpg';

			component.previousImage();

			expect(component.currentViewerIndex).toBe(0);
			expect(component.currentViewerImage).toBe('url1.jpg');
		});
	});

	describe('URL List Features', () => {
		beforeEach(() => {
			component.imageUrls = ['url1.jpg', 'url2.jpg', 'url3.jpg'];
		});

		it('should toggle URL list visibility', () => {
			expect(component.showUrlList).toBe(false);

			component.toggleUrlList();

			expect(component.showUrlList).toBe(true);

			component.toggleUrlList();

			expect(component.showUrlList).toBe(false);
		});

		it('should get all URLs as text', () => {
			const result = component.getAllUrlsText();

			expect(result).toBe('url1.jpg\nurl2.jpg\nurl3.jpg');
		});

		it('should copy all URLs to clipboard', async () => {
			spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
			spyOn(console, 'log');

			await component.copyAllUrls();

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('url1.jpg\nurl2.jpg\nurl3.jpg');
		});

		it('should handle clipboard copy errors', async () => {
			spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject(new Error('Clipboard error')));
			const loggerSpy = spyOn(component['logger'], 'error');

			await component.copyAllUrls();

			expect(loggerSpy).toHaveBeenCalledWith(
				'gallery.copyUrls.failed',
				'Failed to copy URLs',
				jasmine.any(Error)
			);
		});
	});

	describe('Image Alt Text', () => {
		it('should generate correct alt text', () => {
			const result = component.getImageAltText(0);
			expect(result).toBe('Image 1');

			const result2 = component.getImageAltText(5);
			expect(result2).toBe('Image 6');
		});
	});

	describe('Auto-Remove Broken Images', () => {
		beforeEach(() => {
			component.mediaItems = [
				{ url: 'url1.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url2.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url3.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
			];
			component.imageUrls = ['url1.jpg', 'url2.jpg', 'url3.jpg'];
		});

		it('should auto-remove broken images when setting is enabled', () => {
			component.autoRemoveBrokenImages = true;

			// Create a mock img element
			const mockImg = document.createElement('img');
			mockImg.setAttribute('data-original-url', 'url2.jpg');
			mockImg.classList.remove('error'); // Ensure it's not already marked as error

			// Create a mock container
			const mockContainer = document.createElement('div');
			mockContainer.className = 'image-item';
			mockContainer.appendChild(mockImg);

			// Add container to DOM properly
			document.body.appendChild(mockContainer);

			// Mock closest method to return the actual container
			spyOn(mockImg, 'closest').and.returnValue(mockContainer);

			// Mock remove method to avoid actual DOM manipulation issues in tests
			spyOn(mockContainer, 'remove').and.stub();

			// Trigger the error handler
			const errorEvent = new Event('error');
			Object.defineProperty(errorEvent, 'target', { value: mockImg });

			component.onImageError(errorEvent);

			// Verify the broken URL was tracked
			expect((component as unknown as { brokenUrls: Set<string> }).brokenUrls.has('url2.jpg')).toBe(true);

			// Verify container.remove() was called
			expect(mockContainer.remove).toHaveBeenCalled();

			// Verify the arrays were updated
			expect(component.imageUrls).toEqual(['url1.jpg', 'url3.jpg']);
			expect(component.mediaItems).toEqual([
				{ url: 'url1.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url3.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
			]);

			// Clean up
			if (document.body.contains(mockContainer)) {
				document.body.removeChild(mockContainer);
			}
		});

		it('should not auto-remove broken images when setting is disabled', () => {
			component.autoRemoveBrokenImages = false;

			// Create a mock img element
			const mockImg = document.createElement('img');
			mockImg.setAttribute('data-original-url', 'url2.jpg');
			mockImg.classList.remove('error'); // Ensure it's not already marked as error

			// Trigger the error handler
			const errorEvent = new Event('error');
			Object.defineProperty(errorEvent, 'target', { value: mockImg });

			component.onImageError(errorEvent);

			// Verify the broken URL was tracked but arrays weren't updated
			expect((component as unknown as { brokenUrls: Set<string> }).brokenUrls.has('url2.jpg')).toBe(true);
			expect(component.imageUrls).toEqual(['url1.jpg', 'url2.jpg', 'url3.jpg']); // Still contains broken URL
			expect(component.mediaItems.length).toBe(3); // Still has all items
		});
	});

	describe('Broken image session auto-removal', () => {
		beforeEach(() => {
			component.mediaItems = [
				{ url: 'url1.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url2.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url3.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
			];
			component.imageUrls = ['url1.jpg', 'url2.jpg', 'url3.jpg'];
			// Ensure brokenUrls Set exists
			(component as unknown as { brokenUrls: Set<string> }).brokenUrls = new Set();
		});

		it('should auto-remove newly failing images after calling removeBrokenImages()', () => {
			// Calling removeBrokenImages should enable session-based auto removal even if nothing to remove
			component.removeBrokenImages();

			// Create a mock img element that will fail
			const mockImg = document.createElement('img');
			mockImg.setAttribute('data-original-url', 'url2.jpg');
			const container = document.createElement('div');
			container.className = 'image-item';
			container.appendChild(mockImg);
			document.body.appendChild(container);

			spyOn(mockImg, 'closest').and.returnValue(container);
			spyOn(container, 'remove').and.callThrough();

			const errorEvent = new Event('error');
			Object.defineProperty(errorEvent, 'target', { value: mockImg });

			component.onImageError(errorEvent);

			// Container removed and arrays updated (url2 removed)
			expect(container.remove).toHaveBeenCalled();
			expect(component.imageUrls).toEqual(['url1.jpg', 'url3.jpg']);
			expect(component.mediaItems.map((m) => m.url)).toEqual(['url1.jpg', 'url3.jpg']);
		});
	});

	describe('Compression mode selection', () => {
		it('should choose DEFLATE below threshold and STORE at or above threshold', () => {
			const build = component as unknown as { getZipCompressionMode: (n: number) => 'STORE' | 'DEFLATE' };
			expect(build.getZipCompressionMode(100)).toBe('DEFLATE');
			expect(build.getZipCompressionMode(299)).toBe('DEFLATE');
			expect(build.getZipCompressionMode(300)).toBe('STORE');
			expect(build.getZipCompressionMode(1000)).toBe('STORE');
		});
	});

	describe('Zip filename de-duplication', () => {
		type BuildFn = (
			base: string,
			url: string,
			used: Map<string, number>,
			occurrenceIndex: number,
			padWidth: number
		) => string;
		const getBuilder = (): BuildFn =>
			(component as unknown as { buildUniqueZipPath: BuildFn }).buildUniqueZipPath.bind(component);

		it('should suffix duplicates with zero-padded numbering based on duplicate group size (example: 100)', () => {
			// Arrange
			const used = new Map<string, number>();
			const base = 'comic.jpg';
			const urlA = 'https://comic-book-heroes.com/108000/108100/comic.jpg';
			const urlB = 'https://comic-book-heroes.com/108000/108101/comic.jpg';
			const urlZ = 'https://comic-book-heroes.com/108000/108200/comic.jpg';
			const padWidth = 3; // e.g. 100 duplicates → pad length 3
			const build = getBuilder();

			// Act
			const first = build(base, urlA, used, 0, padWidth);
			const second = build(base, urlB, used, 1, padWidth);
			const hundredth = build(base, urlZ, used, 99, padWidth); // 100th occurrence (0-based)

			// Assert
			expect(first).toBe('comic.jpg');
			expect(second).toBe('comic (002).jpg');
			expect(hundredth).toBe('comic (100).jpg');
		});

		it('should use padding relative to total expected files (10 → (02), 1000 → (0002))', () => {
			const used = new Map<string, number>();
			const base = 'image.jpg';
			const url = 'https://example.com/a/b/image.jpg';
			const build = getBuilder();

			// For 10 files → pad width 2
			const secondOfTen = build(base, url, used, 0, 2);
			const dupeOfTen = build(base, url, used, 1, 2);
			expect(secondOfTen).toBe('image.jpg');
			expect(dupeOfTen).toBe('image (02).jpg');

			// Reset map for 1000 files → pad width 4
			const used2 = new Map<string, number>();
			const secondOfThousand = build(base, url, used2, 1, 4);
			expect(secondOfThousand).toBe('image (0002).jpg');
		});
	});

	describe('Video error styling', () => {
		it('should dim broken videos when showBrokenImages is false', () => {
			component.showBrokenImages = false;
			const video = document.createElement('video');
			video.setAttribute('data-original-url', 'broken.mp4');
			const container = document.createElement('div');
			container.className = 'image-item';
			container.appendChild(video);
			document.body.appendChild(container);

			spyOn(video, 'closest').and.returnValue(container);

			const errorEvent = new Event('error');
			Object.defineProperty(errorEvent, 'target', { value: video });
			component.onImageError(errorEvent);

			expect(video.style.opacity).toBe('0.3');
		});
	});

	describe('toggleBrokenImagesVisibility', () => {
		it('should update styles on broken images when toggled', async () => {
			component.showBrokenImages = false;
			const img = document.createElement('img');
			img.classList.add('error');
			document.body.appendChild(img);

			await component.toggleBrokenImagesVisibility();
			expect(component.showBrokenImages).toBe(true);
			expect(img.style.opacity).toBe('1');
			expect(img.style.filter).toBe('none');
		});
	});

	describe('generateMetadataContent', () => {
		it('should include counts and URLs by type', () => {
			(component as unknown as { originalUrl: string }).originalUrl = 'https://example.com/a[01-02].jpg';
			const items: MediaItem[] = [
				{ url: 'a1.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' as const },
				{ url: 'v1.mp4', type: 'video', mimeType: 'video/mp4', loadingState: 'loaded' as const },
				{
					url: 'u1.bin',
					type: 'unknown',
					mimeType: 'application/octet-stream',
					loadingState: 'loaded' as const,
				},
			];
			const content = (component as unknown as { generateMetadataContent: (items: MediaItem[]) => string }).generateMetadataContent(items);
			expect(content).toContain('Fusk Url: https://example.com/a[01-02].jpg');
			expect(content).toContain('IMAGE: a1.jpg');
			expect(content).toContain('VIDEO: v1.mp4');
			expect(content).toContain('UNKNOWN: u1.bin');
			expect(content).toContain('Images: 1');
			expect(content).toContain('Videos: 1');
			expect(content).toContain('Unknown: 1');
		});
	});

	describe('decodeUrlParameter', () => {
		it('should decode base64 URLs', () => {
			const url = 'https://test.example/image.jpg';
			const b64 = btoa(url);
			const decoded = (component as unknown as { decodeUrlParameter: (param: string) => string }).decodeUrlParameter(b64);
			expect(decoded).toBe(url);
		});

		it('should decode URL-encoded strings', () => {
			const encoded = encodeURIComponent('https://example.com/a b');
			const decoded = (component as unknown as { decodeUrlParameter: (param: string) => string }).decodeUrlParameter(encoded);
			expect(decoded).toBe('https://example.com/a b');
		});

		it('should return original when not encoded', () => {
			const plain = 'not-encoded';
			expect((component as unknown as { decodeUrlParameter: (param: string) => string }).decodeUrlParameter(plain)).toBe(plain);
		});
	});

	describe('Progressive type detection', () => {
		it('should update media items based on HTTP detection and keep fallback on failure', async () => {
			// Arrange: two items to detect
			component.mediaItems = [
				{
					url: 'https://example.com/a.jpg',
					type: 'unknown',
					mimeType: 'application/octet-stream',
					loadingState: 'loaded',
				},
				{
					url: 'https://example.com/b.mp4',
					type: 'unknown',
					mimeType: 'application/octet-stream',
					loadingState: 'loaded',
				},
			];

			mockMediaTypeService.determineMediaType.and.callFake(async (url: string) => {
				if (url.endsWith('.jpg')) {
					return { type: 'image', mimeType: 'image/jpeg', contentLength: 123 };
				}
				throw new Error('HEAD failed');
			});

			// Act
			await (component as unknown as { startProgressiveTypeDetection: () => Promise<void> }).startProgressiveTypeDetection();

			// Assert: first becomes image, second remains unknown
			expect(component.mediaItems[0].type).toBe('image');
			expect(component.mediaItems[0].mimeType).toBe('image/jpeg');
			expect(component.mediaItems[1].type).toBe('unknown');
		});
	});

	describe('getValidImageUrls', () => {
		it('should return only successfully loaded media URLs', () => {
			// Create one good image, one broken image, one good video, one broken video
			const goodImg = document.createElement('img');
			goodImg.className = 'fusk-image';
			Object.defineProperty(goodImg, 'complete', { value: true });
			Object.defineProperty(goodImg, 'naturalHeight', { value: 100 });
			goodImg.src = 'https://site/img1.jpg';

			const badImg = document.createElement('img');
			badImg.className = 'fusk-image error';
			Object.defineProperty(badImg, 'complete', { value: true });
			Object.defineProperty(badImg, 'naturalHeight', { value: 0 });
			badImg.src = 'https://site/img2.jpg';

			const goodVid = document.createElement('video');
			goodVid.className = 'fusk-video';
			Object.defineProperty(goodVid, 'readyState', { value: 2 });
			goodVid.src = 'https://site/vid1.mp4';

			const badVid = document.createElement('video');
			badVid.className = 'fusk-video error';
			Object.defineProperty(badVid, 'readyState', { value: 0 });
			badVid.src = 'https://site/vid2.mp4';

			document.body.appendChild(goodImg);
			document.body.appendChild(badImg);
			document.body.appendChild(goodVid);
			document.body.appendChild(badVid);

			const urls = (component as unknown as { getValidImageUrls: () => string[] }).getValidImageUrls();
			expect(urls).toEqual(['https://site/img1.jpg', 'https://site/vid1.mp4']);
		});
	});

	describe('updateImageCounts', () => {
		it('should count loaded and broken images/videos correctly', () => {
			// Reset DOM
			document.body.innerHTML = '';

			const loadedImg = document.createElement('img');
			loadedImg.className = 'fusk-image';
			Object.defineProperty(loadedImg, 'complete', { value: true });
			Object.defineProperty(loadedImg, 'naturalHeight', { value: 50 });
			loadedImg.src = 'https://site/ok.jpg';

			const brokenImg = document.createElement('img');
			brokenImg.className = 'fusk-image error';
			Object.defineProperty(brokenImg, 'complete', { value: true });
			Object.defineProperty(brokenImg, 'naturalHeight', { value: 0 });
			brokenImg.src = 'https://site/bad.jpg';

			const loadedVid = document.createElement('video');
			loadedVid.className = 'fusk-video';
			Object.defineProperty(loadedVid, 'readyState', { value: 2 });
			loadedVid.src = 'https://site/ok.mp4';

			const brokenVid = document.createElement('video');
			brokenVid.className = 'fusk-video error';
			Object.defineProperty(brokenVid, 'readyState', { value: 0 });
			brokenVid.src = 'https://site/bad.mp4';

			document.body.appendChild(loadedImg);
			document.body.appendChild(brokenImg);
			document.body.appendChild(loadedVid);
			document.body.appendChild(brokenVid);

			(component as unknown as { updateImageCounts: () => void }).updateImageCounts();
			expect(component.loadedImages).toBe(2);
			expect(component.brokenImages).toBe(2);
		});
	});
});
