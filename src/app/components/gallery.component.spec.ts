import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { GalleryComponent } from './gallery.component';
import { FuskrService } from '../services/fuskr.service';
import { ChromeService } from '../services/chrome.service';

// Type-only import for VS Code IntelliSense - won't be included in runtime bundle
import type {} from 'jasmine';

describe('GalleryComponent', () => {
	let component: GalleryComponent;
	let fixture: ComponentFixture<GalleryComponent>;
	let mockFuskrService: jasmine.SpyObj<FuskrService>;
	let mockChromeService: jasmine.SpyObj<ChromeService>;
	let mockRouter: jasmine.SpyObj<Router>;
	let mockActivatedRoute: any;

	beforeEach(async () => {
		mockFuskrService = jasmine.createSpyObj('FuskrService', ['generateImageGallery', 'getImageFilename']);
		mockChromeService = jasmine.createSpyObj('ChromeService', ['isExtensionContext', 'openTab', 'downloadFile']);
		mockRouter = jasmine.createSpyObj('Router', ['navigate']);
		mockActivatedRoute = {
			queryParams: of({ url: 'https://example.com/test.jpg' })
		};

		await TestBed.configureTestingModule({
			declarations: [GalleryComponent],
			providers: [
				{ provide: FuskrService, useValue: mockFuskrService },
				{ provide: ChromeService, useValue: mockChromeService },
				{ provide: Router, useValue: mockRouter },
				{ provide: ActivatedRoute, useValue: mockActivatedRoute }
			]
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
		it('should generate gallery from URL', () => {
			const mockResult = {
				originalUrl: 'https://example.com/image[01-10].jpg',
				urls: ['https://example.com/image01.jpg', 'https://example.com/image02.jpg']
			};
			mockFuskrService.generateImageGallery.and.returnValue(mockResult);

			component.originalUrl = 'https://example.com/image05.jpg';
			component.generateGallery();

			expect(mockFuskrService.generateImageGallery).toHaveBeenCalledWith('https://example.com/image05.jpg');
			expect(component.imageUrls).toEqual(mockResult.urls);
			expect(component.originalUrl).toBe(mockResult.originalUrl);
		});

		it('should handle empty URL', () => {
			component.originalUrl = '';
			component.generateGallery();

			expect(component.errorMessage).toBe('Please enter a valid URL');
			expect(mockFuskrService.generateImageGallery).not.toHaveBeenCalled();
		});
	});

	describe('Image Actions', () => {
		it('should open image in extension context', () => {
			const testUrl = 'https://example.com/test.jpg';
			mockChromeService.isExtensionContext.and.returnValue(true);

			component.openImage(testUrl);

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
	});
});
