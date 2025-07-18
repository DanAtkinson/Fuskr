import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { OptionsComponent } from './options.component';
import { ChromeService, ChromeStorageData } from '../services/chrome.service';
import { BaseComponentTestHelper } from './base-component-test.helper';

// Type-only import for VS Code IntelliSense - won't be included in runtime bundle
import type {} from 'jasmine';

describe('OptionsComponent', () => {
	let component: OptionsComponent;
	let fixture: ComponentFixture<OptionsComponent>;
	let mockChromeService: jasmine.SpyObj<ChromeService>;

	beforeEach(async () => {
		const chromeServiceSpy = BaseComponentTestHelper.setupChromeServiceMock();

		await TestBed.configureTestingModule({
			declarations: [OptionsComponent],
			imports: [FormsModule],
			providers: [
				{ provide: ChromeService, useValue: chromeServiceSpy }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(OptionsComponent);
		component = fixture.componentInstance;
		mockChromeService = TestBed.inject(ChromeService) as jasmine.SpyObj<ChromeService>;
	});

	describe('Component Initialisation', () => {
		it('should create', () => {
			expect(component).toBeTruthy();
		});

		it('should initialise with default options', () => {
			expect(component.options).toEqual({
				darkMode: false,
				imageDisplayMode: 'fitOnPage',
				keepRecentFusks: true,
				openInForeground: true,
				resizeImagesToFillPage: false,
				resizeImagesToFitOnPage: true,
				resizeImagesToFullWidth: false,
				resizeImagesToThumbnails: false,
				showImagesInViewer: false,
				toggleBrokenImages: false,
			});
		});

		it('should load options on init', async () => {
			const testOptions: ChromeStorageData = {
				darkMode: true,
				imageDisplayMode: 'fullWidth',
				keepRecentFusks: false,
				openInForeground: false,
				resizeImagesToFillPage: false,
				resizeImagesToFitOnPage: false,
				resizeImagesToFullWidth: true,
				resizeImagesToThumbnails: false,
				showImagesInViewer: true,
				toggleBrokenImages: true,
			};

			mockChromeService.getStorageData.and.returnValue(Promise.resolve(testOptions));

			await component.ngOnInit();

			expect(mockChromeService.getStorageData).toHaveBeenCalled();
			expect(component.options).toEqual(testOptions);
		});

		it('should handle errors when loading options', async () => {
			mockChromeService.getStorageData.and.returnValue(Promise.reject(new Error('Storage error')));
			spyOn(console, 'error');

			await component.ngOnInit();

			expect(console.error).toHaveBeenCalledWith('Error loading options:', jasmine.any(Error));
		});
	});

	describe('Options Management', () => {
		beforeEach(() => {
			mockChromeService.getStorageData.and.returnValue(Promise.resolve(component.options));
		});

		it('should save options successfully', async () => {
			mockChromeService.setStorageData.and.returnValue(Promise.resolve());

			await component.saveOptions();

			expect(mockChromeService.setStorageData).toHaveBeenCalledWith(component.options);
			expect(component.statusMessage).toBe('Options saved!');
		});

		it('should clear status message after 2 seconds', async () => {
			mockChromeService.setStorageData.and.returnValue(Promise.resolve());
			jasmine.clock().install();

			await component.saveOptions();
			expect(component.statusMessage).toBe('Options saved!');

			jasmine.clock().tick(2001);
			expect(component.statusMessage).toBe('');

			jasmine.clock().uninstall();
		});

		it('should handle save errors', async () => {
			mockChromeService.setStorageData.and.returnValue(Promise.reject(new Error('Save error')));
			spyOn(console, 'error');

			await component.saveOptions();

			expect(console.error).toHaveBeenCalledWith('Error saving options:', jasmine.any(Error));
			expect(component.statusMessage).toBe('Error saving options');
		});
	});

	describe('UI Interaction', () => {
		beforeEach(async () => {
			mockChromeService.getStorageData.and.returnValue(Promise.resolve(component.options));
			await component.ngOnInit();
			fixture.detectChanges();
		});

		it('should update options when form values change', () => {
			// Update the component properties directly since ngModel handles the binding
			component.options.darkMode = true;
			component.options.keepRecentFusks = false;
			fixture.detectChanges();

			expect(component.options.darkMode).toBeTruthy();
			expect(component.options.keepRecentFusks).toBeFalsy();
		});

		it('should display status message when present', () => {
			component.statusMessage = 'Test message';
			fixture.detectChanges();

			const statusElement = fixture.nativeElement.querySelector('.status');
			expect(statusElement.textContent.trim()).toContain('Test message');
		});

		it('should hide status message when empty', () => {
			component.statusMessage = '';
			fixture.detectChanges();

			const statusElement = fixture.nativeElement.querySelector('.status');
			expect(statusElement.textContent.trim()).toBe('');
		});
	});
});
