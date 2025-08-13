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
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockFuskrService = jasmine.createSpyObj('FuskrService', [
      'generateImageGallery',
      'getImageFilename',
      'countPotentialUrls',
    ]);
    mockMediaTypeService = jasmine.createSpyObj('MediaTypeService', ['batchDetermineMediaTypes']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      queryParams: of({ url: 'https://example.com/test.jpg' }),
      snapshot: { queryParams: {} },
    };

    // Setup the ChromeService mock using BaseComponentTestHelper
    mockChromeService = BaseComponentTestHelper.setupChromeServiceMock();

    await TestBed.configureTestingModule({
      declarations: [GalleryComponent],
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
      const mockMediaItems: MediaItem[] = [
        {
          url: 'https://example.com/image01.jpg',
          type: 'image',
          mimeType: 'image/jpeg',
          loadingState: 'loaded',
          extension: 'jpg',
        },
        {
          url: 'https://example.com/image02.jpg',
          type: 'image',
          mimeType: 'image/jpeg',
          loadingState: 'loaded',
          extension: 'jpg',
        },
      ];

      mockFuskrService.generateImageGallery.and.returnValue(mockResult);
      mockFuskrService.countPotentialUrls.and.returnValue(2); // Below limit
      mockMediaTypeService.batchDetermineMediaTypes.and.returnValue(Promise.resolve(mockMediaItems));

      component.originalUrl = 'https://example.com/image05.jpg';
      await component.generateGallery();

      expect(mockFuskrService.countPotentialUrls).toHaveBeenCalledWith('https://example.com/image05.jpg');
      expect(mockFuskrService.generateImageGallery).toHaveBeenCalledWith('https://example.com/image05.jpg');
      expect(mockMediaTypeService.batchDetermineMediaTypes).toHaveBeenCalledWith(mockResult.urls, 5);
      expect(component.imageUrls).toEqual(mockResult.urls);
      expect(component.mediaItems).toEqual(mockMediaItems);
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
        urls: Array.from({ length: 1000 }, (_, i) => `https://example.com/image${String(i + 1).padStart(3, '0')}.jpg`),
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
      expect(mockFuskrService.generateImageGallery).toHaveBeenCalledWith('https://example.com/image[001-1000].jpg');
    });

    it('should bypass overload protection when disabled', () => {
      const mockResult = {
        originalUrl: 'https://example.com/image[001-1000].jpg',
        urls: Array.from({ length: 1000 }, (_, i) => `https://example.com/image${String(i + 1).padStart(3, '0')}.jpg`),
      };

      mockFuskrService.generateImageGallery.and.returnValue(mockResult);

      component.originalUrl = 'https://example.com/image[001-1000].jpg';
      component.enableOverloadProtection = false; // Disabled
      component.generateGallery();

      expect(mockFuskrService.countPotentialUrls).not.toHaveBeenCalled(); // Should skip count check
      expect(mockFuskrService.generateImageGallery).toHaveBeenCalledWith('https://example.com/image[001-1000].jpg');
    });

    it('should open image in browser for non-extension context', () => {
      const testUrl = 'https://example.com/test.jpg';
      mockChromeService.isExtensionContext.and.returnValue(false);
      spyOn(window, 'open');

      component.openImage(testUrl);

      expect(window.open).toHaveBeenCalledWith(testUrl, '_blank');
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

      expect(loggerSpy).toHaveBeenCalledWith('gallery.copyUrls.failed', 'Failed to copy URLs', jasmine.any(Error));
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
});
