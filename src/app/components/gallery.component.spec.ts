import type { MockedObject } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { GalleryComponent } from './gallery.component';
import { FuskrService } from '@services/fuskr.service';
import { ChromeService } from '@services/chrome.service';
import { MediaTypeService } from '@services/media-type.service';
import { BaseComponentTestHelper } from './base-component-test.helper';
import { MediaItem } from '@interfaces/media';

describe('GalleryComponent', () => {
	let component: GalleryComponent;
	let fixture: ComponentFixture<GalleryComponent>;
	let mockFuskrService: MockedObject<FuskrService>;
	let mockChromeService: MockedObject<ChromeService>;
	let mockMediaTypeService: MockedObject<MediaTypeService>;
	let mockRouter: MockedObject<Router>;
	let mockActivatedRoute: Partial<ActivatedRoute>;

	beforeEach(async () => {
		mockFuskrService = {
			createFuskUrl: vi.fn().mockName('FuskrService.createFuskUrl'),
			generateImageGallery: vi.fn().mockName('FuskrService.generateImageGallery'),
			getImageFilename: vi.fn().mockName('FuskrService.getImageFilename'),
			countPotentialUrls: vi.fn().mockName('FuskrService.countPotentialUrls'),
		};
		mockMediaTypeService = {
			batchDetermineMediaTypes: vi.fn().mockName('MediaTypeService.batchDetermineMediaTypes'),
			createMediaItem: vi.fn().mockName('MediaTypeService.createMediaItem'),
			fallbackTypeDetection: vi.fn().mockName('MediaTypeService.fallbackTypeDetection'),
			determineMediaType: vi.fn().mockName('MediaTypeService.determineMediaType'),
		};
		mockRouter = {
			navigate: vi.fn().mockName('Router.navigate'),
		};
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
			expect(component.mediaItems).toEqual([]);
			expect(component.loading).toBeFalsy();
		});
	});

	describe('Gallery Generation', () => {
		it('should generate gallery from URL', async () => {
			const mockResult = {
				originalUrl: 'https://example.com/image[01-10].jpg',
				urls: ['https://example.com/image01.jpg', 'https://example.com/image02.jpg'],
			};

			mockFuskrService.generateImageGallery.mockReturnValue(mockResult);
			mockFuskrService.countPotentialUrls.mockReturnValue(2); // Below limit
			mockMediaTypeService.createMediaItem.mockImplementation((url: string) => ({
				url,
				type: 'unknown',
				mimeType: 'application/octet-stream',
				loadingState: 'pending',
				extension: url.split('.').pop()?.toLowerCase(),
			}));
			mockMediaTypeService.fallbackTypeDetection.mockImplementation(
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
			expect(component.mediaItems.map((m) => m.url)).toEqual(mockResult.urls);
			expect(component.mediaItems.length).toBe(2);
			expect(component.mediaItems[0].type).toBe('image');
			expect(component.originalUrl).toBe(mockResult.originalUrl);
		});

		it('should convert a custom count request before generating the gallery', async () => {
			const generatedUrl = 'https://example.com/image[05-08].jpg';
			const mockResult = {
				originalUrl: generatedUrl,
				urls: ['https://example.com/image05.jpg', 'https://example.com/image06.jpg'],
			};

			mockFuskrService.createFuskUrl.mockReturnValue(generatedUrl);
			mockFuskrService.countPotentialUrls.mockReturnValue(2);
			mockFuskrService.generateImageGallery.mockReturnValue(mockResult);
			mockMediaTypeService.createMediaItem.mockImplementation((url: string) => ({
				url,
				type: 'unknown',
				mimeType: 'application/octet-stream',
				loadingState: 'pending',
				extension: url.split('.').pop()?.toLowerCase(),
			}));
			mockMediaTypeService.fallbackTypeDetection.mockReturnValue({
				type: 'image',
				mimeType: 'image/jpeg',
			});

			component.originalUrl = 'https://example.com/image05.jpg';
			component.customCountRequested = true;
			component.customCountDirection = 1;
			component.customCountValue = '3';

			await component.generateGallery();

			expect(mockFuskrService.createFuskUrl).toHaveBeenCalledWith('https://example.com/image05.jpg', 3, 1);
			expect(mockFuskrService.countPotentialUrls).toHaveBeenCalledWith(generatedUrl);
			expect(mockFuskrService.generateImageGallery).toHaveBeenCalledWith(generatedUrl);
			expect(component.customCountRequested).toBe(false);
			expect(component.originalUrl).toBe(generatedUrl);
		});

		it('should show an inline error for an invalid custom count', () => {
			component.originalUrl = 'https://example.com/image05.jpg';
			component.customCountRequested = true;
			component.customCountValue = 'nope';

			component.generateGallery();

			expect(component.errorMessage).toBe('This is not a valid number.');
			expect(mockFuskrService.createFuskUrl).not.toHaveBeenCalled();
			expect(mockFuskrService.generateImageGallery).not.toHaveBeenCalled();
		});

		it('should handle empty URL', () => {
			component.originalUrl = '';
			component.generateGallery();

			expect(component.errorMessage).toBe('Please enter a valid URL');
			expect(mockFuskrService.generateImageGallery).not.toHaveBeenCalled();
		});

		it('should trigger overload protection when URL count exceeds limit', () => {
			vi.spyOn(window, 'confirm').mockReturnValue(false); // User chooses not to proceed
			mockFuskrService.countPotentialUrls.mockReturnValue(1000); // Above default limit of 500

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

			vi.spyOn(window, 'confirm').mockReturnValue(true); // User chooses to proceed
			mockFuskrService.countPotentialUrls.mockReturnValue(1000);
			mockFuskrService.generateImageGallery.mockReturnValue(mockResult);

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

			mockFuskrService.generateImageGallery.mockReturnValue(mockResult);

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
			mockChromeService.isExtensionContext.mockReturnValue(false);
			vi.spyOn(window, 'open');

			component.openImage(testUrl);

			expect(window.open).toHaveBeenCalledWith(testUrl, '_blank');
		});

		it('should open image in tab using openInTab method', () => {
			const testUrl = 'https://example.com/test.jpg';
			const mockEvent = new Event('click');
			vi.spyOn(mockEvent, 'stopPropagation');
			vi.spyOn(mockEvent, 'preventDefault');
			mockChromeService.isExtensionContext.mockReturnValue(false);
			vi.spyOn(window, 'open');

			component.openInTab(testUrl, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(window.open).toHaveBeenCalledWith(testUrl, '_blank');
		});

		it('should open image in tab using Chrome service for extension context', () => {
			const testUrl = 'https://example.com/test.jpg';
			const mockEvent = new Event('click');
			vi.spyOn(mockEvent, 'stopPropagation');
			vi.spyOn(mockEvent, 'preventDefault');
			mockChromeService.isExtensionContext.mockReturnValue(true);

			component.openInTab(testUrl, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockChromeService.openTab).toHaveBeenCalledWith(testUrl);
		});

		it('should download single image', () => {
			const testUrl = 'https://example.com/test.jpg';
			const mockEvent = new Event('click');
			vi.spyOn(mockEvent, 'stopPropagation');
			mockFuskrService.getImageFilename.mockReturnValue('test.jpg');

			component.downloadImage(testUrl, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(mockChromeService.downloadFile).toHaveBeenCalledWith(testUrl, 'test.jpg');
		});

		it('should copy URL to clipboard', async () => {
			const testUrl = 'https://example.com/test.jpg';
			const mockEvent = new Event('click');
			vi.spyOn(mockEvent, 'stopPropagation');
			vi.spyOn(navigator.clipboard, 'writeText').mockReturnValue(Promise.resolve());
			vi.spyOn(console, 'log');

			await component.copyUrl(testUrl, mockEvent);

			expect(mockEvent.stopPropagation).toHaveBeenCalled();
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testUrl);
		});
	});

	describe('Image Viewer', () => {
		beforeEach(() => {
			component.mediaItems = [
				{ url: 'url1.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url2.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url3.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
			];
			// Initialize brokenUrls as empty set using component accessor
			(
				component as unknown as {
					brokenUrls: Set<string>;
				}
			).brokenUrls = new Set();
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

	describe('Image Viewer Focus Management', () => {
		beforeEach(() => {
			component.mediaItems = [
				{ url: 'url1.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url2.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
			];
			(component as unknown as { brokenUrls: Set<string> }).brokenUrls = new Set();
		});

		it('should save the active element as the trigger when opening the viewer', () => {
			const trigger = document.createElement('button');
			document.body.appendChild(trigger);
			trigger.focus();

			component.openImageViewer('url1.jpg', 0);

			expect((component as unknown as { viewerTriggerElement: HTMLElement | null }).viewerTriggerElement).toBe(
				trigger
			);
			document.body.removeChild(trigger);
		});

		it('should restore focus to the trigger element after closing the viewer', () => {
			vi.useFakeTimers();
			const trigger = document.createElement('button');
			document.body.appendChild(trigger);
			const focusSpy = vi.spyOn(trigger, 'focus');

			(component as unknown as { viewerTriggerElement: HTMLElement | null }).viewerTriggerElement = trigger;
			component.showImageViewer = true;

			component.closeImageViewer();
			vi.runAllTimers();

			expect(focusSpy).toHaveBeenCalled();
			document.body.removeChild(trigger);
		});

		it('should trap Tab focus and wrap from last to first focusable element', () => {
			component.showImageViewer = true;

			// Create a minimal viewer-content element with two buttons
			const modal = document.createElement('div');
			modal.className = 'viewer-content';
			const btn1 = document.createElement('button');
			btn1.textContent = 'First';
			const btn2 = document.createElement('button');
			btn2.textContent = 'Last';
			modal.appendChild(btn1);
			modal.appendChild(btn2);
			document.body.appendChild(modal);

			// Simulate focus on last element, then Tab
			btn2.focus();
			const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
			const preventSpy = vi.spyOn(tabEvent, 'preventDefault');
			component.handleKeyboardEvent(tabEvent);
			expect(preventSpy).toHaveBeenCalled();

			document.body.removeChild(modal);
		});

		it('should trap Shift+Tab focus and wrap from first to last focusable element', () => {
			component.showImageViewer = true;

			const modal = document.createElement('div');
			modal.className = 'viewer-content';
			const btn1 = document.createElement('button');
			btn1.textContent = 'First';
			const btn2 = document.createElement('button');
			btn2.textContent = 'Last';
			modal.appendChild(btn1);
			modal.appendChild(btn2);
			document.body.appendChild(modal);

			btn1.focus();
			const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
			const preventSpy = vi.spyOn(shiftTabEvent, 'preventDefault');
			component.handleKeyboardEvent(shiftTabEvent);
			expect(preventSpy).toHaveBeenCalled();

			document.body.removeChild(modal);
		});
	});

	describe('URL List Features', () => {
		beforeEach(() => {
			component.mediaItems = [
				{ url: 'url1.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url2.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url3.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
			];
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
			vi.spyOn(navigator.clipboard, 'writeText').mockReturnValue(Promise.resolve());
			vi.spyOn(console, 'log');

			await component.copyAllUrls();

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith('url1.jpg\nurl2.jpg\nurl3.jpg');
		});

		it('should handle clipboard copy errors', async () => {
			vi.spyOn(navigator.clipboard, 'writeText').mockReturnValue(Promise.reject(new Error('Clipboard error')));
			const loggerSpy = vi.spyOn(component['logger'], 'error');

			await component.copyAllUrls();

			expect(loggerSpy).toHaveBeenCalledWith('gallery.copyUrls.failed', 'Failed to copy URLs', expect.any(Error));
		});
	});

	describe('Image Alt Text', () => {
		beforeEach(() => {
			component.mediaItems = [
				{
					url: 'https://example.com/image001.jpg',
					type: 'image',
					mimeType: 'image/jpeg',
					loadingState: 'loaded',
				},
				{
					url: 'https://example.com/image002.jpg',
					type: 'image',
					mimeType: 'image/jpeg',
					loadingState: 'loaded',
				},
			];
			(component as unknown as { brokenUrls: Set<string> }).brokenUrls = new Set();
			// Configure mock to return the filename portion of a URL
			mockFuskrService.getImageFilename.mockImplementation((url: string) =>
				url.substring(url.lastIndexOf('/') + 1)
			);
		});

		it('should return the filename from the URL as alt text', () => {
			const result = component.getImageAltText(0);
			expect(result).toBe('image001.jpg');
		});

		it('should return the correct filename for other indices', () => {
			const result = component.getImageAltText(1);
			expect(result).toBe('image002.jpg');
		});

		it('should fall back to numbered alt text when index is out of range', () => {
			const result = component.getImageAltText(99);
			expect(result).toBe('Image 100');
		});
	});

	describe('Auto-Remove Broken Images', () => {
		beforeEach(() => {
			component.mediaItems = [
				{ url: 'url1.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url2.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
				{ url: 'url3.jpg', type: 'image', mimeType: 'image/jpeg', loadingState: 'loaded' },
			];
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
			vi.spyOn(mockImg, 'closest').mockReturnValue(mockContainer);

			// Mock remove method to avoid actual DOM manipulation issues in tests
			vi.spyOn(mockContainer, 'remove').mockImplementation(() => undefined);

			// Trigger the error handler
			const errorEvent = new Event('error');
			Object.defineProperty(errorEvent, 'target', { value: mockImg });

			component.onImageError(errorEvent);

			// Verify the broken URL was tracked
			expect(
				(
					component as unknown as {
						brokenUrls: Set<string>;
					}
				).brokenUrls.has('url2.jpg')
			).toBe(true);

			// Verify container.remove() was called
			expect(mockContainer.remove).toHaveBeenCalled();

			// Verify the mediaItems array was updated
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
			expect(
				(
					component as unknown as {
						brokenUrls: Set<string>;
					}
				).brokenUrls.has('url2.jpg')
			).toBe(true);
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
			// Ensure brokenUrls Set exists
			(
				component as unknown as {
					brokenUrls: Set<string>;
				}
			).brokenUrls = new Set();
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

			vi.spyOn(mockImg, 'closest').mockReturnValue(container);
			vi.spyOn(container, 'remove');

			const errorEvent = new Event('error');
			Object.defineProperty(errorEvent, 'target', { value: mockImg });

			component.onImageError(errorEvent);

			// Container removed and mediaItems updated (url2 removed)
			expect(container.remove).toHaveBeenCalled();
			expect(component.mediaItems.map((m) => m.url)).toEqual(['url1.jpg', 'url3.jpg']);
		});
	});

	describe('Compression mode selection', () => {
		it('should choose DEFLATE below threshold and STORE at or above threshold', () => {
			const build = component as unknown as {
				getZipCompressionMode: (n: number) => 'STORE' | 'DEFLATE';
			};
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
			(
				component as unknown as {
					buildUniqueZipPath: BuildFn;
				}
			).buildUniqueZipPath.bind(component);

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

			vi.spyOn(video, 'closest').mockReturnValue(container);

			const errorEvent = new Event('error');
			Object.defineProperty(errorEvent, 'target', { value: video });
			component.onImageError(errorEvent);

			expect(video.style.opacity).toBe('0.3');
		});
	});

	describe('Navigation guard during download', () => {
		it('should navigate to history when not downloading', () => {
			component.isDownloading = false;

			component.navigateToHistory();

			expect(mockRouter.navigate).toHaveBeenCalledWith(['/history']);
		});

		it('should navigate to options when not downloading', () => {
			component.isDownloading = false;

			component.navigateToOptions();

			expect(mockRouter.navigate).toHaveBeenCalledWith(['/options']);
		});

		it('should block navigation to history and prompt when download is in progress', () => {
			component.isDownloading = true;
			vi.spyOn(window, 'confirm').mockReturnValue(false);

			component.navigateToHistory();

			expect(window.confirm).toHaveBeenCalled();
			expect(mockRouter.navigate).not.toHaveBeenCalled();
		});

		it('should block navigation to options and prompt when download is in progress', () => {
			component.isDownloading = true;
			vi.spyOn(window, 'confirm').mockReturnValue(false);

			component.navigateToOptions();

			expect(window.confirm).toHaveBeenCalled();
			expect(mockRouter.navigate).not.toHaveBeenCalled();
		});

		it('should allow navigation to history when user confirms despite active download', () => {
			component.isDownloading = true;
			vi.spyOn(window, 'confirm').mockReturnValue(true);

			component.navigateToHistory();

			expect(mockRouter.navigate).toHaveBeenCalledWith(['/history']);
		});

		it('should allow navigation to options when user confirms despite active download', () => {
			component.isDownloading = true;
			vi.spyOn(window, 'confirm').mockReturnValue(true);

			component.navigateToOptions();

			expect(mockRouter.navigate).toHaveBeenCalledWith(['/options']);
		});

		it('should set beforeunload handler when download is in progress', () => {
			component.isDownloading = true;
			const event = new Event('beforeunload') as BeforeUnloadEvent;
			vi.spyOn(event, 'preventDefault');

			component.handleBeforeUnload(event);

			expect(event.preventDefault).toHaveBeenCalled();
		});

		it('should not interfere with beforeunload when not downloading', () => {
			component.isDownloading = false;
			const event = new Event('beforeunload') as BeforeUnloadEvent;
			vi.spyOn(event, 'preventDefault');

			component.handleBeforeUnload(event);

			expect(event.preventDefault).not.toHaveBeenCalled();
		});

		it('should not show a confirm dialog when navigating to history whilst idle', () => {
			component.isDownloading = false;
			vi.spyOn(window, 'confirm');

			component.navigateToHistory();

			expect(window.confirm).not.toHaveBeenCalled();
		});

		it('should not show a confirm dialog when navigating to options whilst idle', () => {
			component.isDownloading = false;
			vi.spyOn(window, 'confirm');

			component.navigateToOptions();

			expect(window.confirm).not.toHaveBeenCalled();
		});

		it('should allow navigation to history once isDownloading resets to false', () => {
			component.isDownloading = true;
			component.isDownloading = false;

			component.navigateToHistory();

			// No confirm dialog, navigation proceeds directly
			expect(mockRouter.navigate).toHaveBeenCalledWith(['/history']);
		});

		it('should allow navigation to options once isDownloading resets to false', () => {
			component.isDownloading = true;
			component.isDownloading = false;

			component.navigateToOptions();

			expect(mockRouter.navigate).toHaveBeenCalledWith(['/options']);
		});

		it('should not navigate when user cancels both history and options prompts', () => {
			component.isDownloading = true;
			vi.spyOn(window, 'confirm').mockReturnValue(false);

			component.navigateToHistory();
			component.navigateToOptions();

			expect(mockRouter.navigate).not.toHaveBeenCalled();
			expect(window.confirm).toHaveBeenCalledTimes(2);
		});

		it('should show the download-in-progress confirmation message', () => {
			component.isDownloading = true;
			vi.spyOn(window, 'confirm').mockReturnValue(false);

			component.navigateToHistory();

			expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('download is in progress'));
		});
	});

	describe('Keyboard navigation (gallery)', () => {
		const makeItems = (urls: string[]): MediaItem[] =>
			urls.map((url) => ({
				url,
				type: 'image' as const,
				mimeType: 'image/jpeg',
				loadingState: 'loaded' as const,
			}));

		beforeEach(() => {
			component.mediaItems = makeItems(['a.jpg', 'b.jpg', 'c.jpg']);
			(component as unknown as { brokenUrls: Set<string> }).brokenUrls = new Set();
			// jsdom does not implement scrollIntoView
			Element.prototype.scrollIntoView = vi.fn();
		});

		it('End key navigates to the last visible item', () => {
			component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'End' }));

			expect(component.currentGalleryIndex).toBe(2);
		});

		it('Home key navigates to the first visible item', () => {
			component.currentGalleryIndex = 2;
			component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'Home' }));

			expect(component.currentGalleryIndex).toBe(0);
		});

		it('End key navigates to last VISIBLE item when broken images are hidden', () => {
			// Mark the last item as broken (hidden from view)
			(component as unknown as { brokenUrls: Set<string> }).brokenUrls = new Set(['c.jpg']);

			component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'End' }));

			// Only 2 visible items (a.jpg, b.jpg) — index should be 1, not 2
			expect(component.currentGalleryIndex).toBe(1);
		});

		it('End key does nothing when all images are broken and hidden', () => {
			(component as unknown as { brokenUrls: Set<string> }).brokenUrls = new Set(['a.jpg', 'b.jpg', 'c.jpg']);
			component.currentGalleryIndex = -1;

			component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'End' }));

			expect(component.currentGalleryIndex).toBe(-1);
		});

		it('ArrowRight wraps to first item after last visible item', () => {
			(component as unknown as { brokenUrls: Set<string> }).brokenUrls = new Set(['c.jpg']);
			component.currentGalleryIndex = 1; // Last visible item (b.jpg)

			component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

			expect(component.currentGalleryIndex).toBe(0);
		});

		it('ArrowLeft wraps to last visible item from the first', () => {
			(component as unknown as { brokenUrls: Set<string> }).brokenUrls = new Set(['c.jpg']);
			component.currentGalleryIndex = 0;

			component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

			expect(component.currentGalleryIndex).toBe(1); // Last visible (b.jpg)
		});

		it('ArrowRight advances within visible items', () => {
			component.currentGalleryIndex = 0;

			component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

			expect(component.currentGalleryIndex).toBe(1);
		});

		it('keyboard events are ignored when a form element has focus', () => {
			component.currentGalleryIndex = 0;
			const input = document.createElement('input');
			document.body.appendChild(input);
			input.focus();

			component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'End' }));

			expect(component.currentGalleryIndex).toBe(0);
			document.body.removeChild(input);
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
			component.originalUrl = 'https://example.com/a[01-02].jpg';
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
			const content = (
				component as unknown as {
					generateMetadataContent: (items: MediaItem[]) => string;
				}
			).generateMetadataContent(items);
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
			const decoded = (
				component as unknown as {
					decodeUrlParameter: (param: string) => string;
				}
			).decodeUrlParameter(b64);
			expect(decoded).toBe(url);
		});

		it('should decode URL-encoded strings', () => {
			const encoded = encodeURIComponent('https://example.com/a b');
			const decoded = (
				component as unknown as {
					decodeUrlParameter: (param: string) => string;
				}
			).decodeUrlParameter(encoded);
			expect(decoded).toBe('https://example.com/a b');
		});

		it('should return original when not encoded', () => {
			const plain = 'not-encoded';
			expect(
				(
					component as unknown as {
						decodeUrlParameter: (param: string) => string;
					}
				).decodeUrlParameter(plain)
			).toBe(plain);
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

			mockMediaTypeService.determineMediaType.mockImplementation(async (url: string) => {
				if (url.endsWith('.jpg')) {
					return { type: 'image', mimeType: 'image/jpeg', contentLength: 123 };
				}
				throw new Error('HEAD failed');
			});

			// Act
			await (
				component as unknown as {
					startProgressiveTypeDetection: () => Promise<void>;
				}
			).startProgressiveTypeDetection();

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

			const urls = (
				component as unknown as {
					getValidImageUrls: () => string[];
				}
			).getValidImageUrls();
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

			(
				component as unknown as {
					updateImageCounts: () => void;
				}
			).updateImageCounts();
			expect(component.loadedImages).toBe(2);
			expect(component.brokenImages).toBe(2);
		});
	});
});
