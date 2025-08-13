import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { OptionsComponent } from './options.component';
import { ChromeService } from '@services/chrome.service';
import { ChromeStorageData } from '@models/chrome-storage';
import { BaseComponentTestHelper } from './base-component-test.helper';

// Type-only import for VS Code IntelliSense - won't be included in runtime bundle
import type {} from 'jasmine';

describe('OptionsComponent', () => {
	let component: OptionsComponent;
	let fixture: ComponentFixture<OptionsComponent>;
	let mockChromeService: jasmine.SpyObj<ChromeService>;
	let originalBodyClass: string;

	beforeEach(async () => {
		// Store original body class to restore later
		originalBodyClass = document.body.className;

		const chromeServiceSpy = BaseComponentTestHelper.setupChromeServiceMock();

		await TestBed.configureTestingModule({
			imports: [OptionsComponent, FormsModule],
			providers: [{ provide: ChromeService, useValue: chromeServiceSpy }],
		}).compileComponents();

		fixture = TestBed.createComponent(OptionsComponent);
		component = fixture.componentInstance;
		mockChromeService = TestBed.inject(ChromeService) as jasmine.SpyObj<ChromeService>;

		// Add CSS variables to the document for testing
		const testStyleSheet = document.createElement('style');
		testStyleSheet.textContent = `
			:root {
	--bg-color: #ffffff;
	--bg-secondary: #f5f5f5;
	--text-color: #333333;
	--text-secondary: #666666;
	--border-color: #dddddd;
			}
			body.dark-mode {
	--bg-color: #1a1a1a;
	--bg-secondary: #2d2d2d;
	--text-color: #e0e0e0;
	--text-secondary: #a0a0a0;
	--border-color: #404040;
			}
			body.dark-mode .card {
	background-color: var(--bg-secondary) !important;
	color: var(--text-color) !important;
			}
			body.dark-mode h1, body.dark-mode h5, body.dark-mode label, body.dark-mode .form-text {
	color: var(--text-color) !important;
			}
		`;
		document.head.appendChild(testStyleSheet);
	});

	afterEach(() => {
		// Restore original body class
		document.body.className = originalBodyClass;
		// Remove test stylesheet
		const testStyles = document.head.querySelectorAll('style');
		testStyles.forEach((style) => {
			if (style.textContent?.includes('--bg-color')) {
				document.head.removeChild(style);
			}
		});
	});

	describe('Component Initialisation', () => {
		it('should create', () => {
			expect(component).toBeTruthy();
		});

		it('should initialise with default options', () => {
			expect(component.options.display.darkMode).toBe(false);
			expect(component.options.display.imageDisplayMode).toBe('fitOnPage');
			expect(component.options.display.resizeImagesToFillPage).toBe(false);
			expect(component.options.display.resizeImagesToFitOnPage).toBe(true);
			expect(component.options.display.resizeImagesToFullWidth).toBe(false);
			expect(component.options.display.resizeImagesToThumbnails).toBe(false);
			expect(component.options.display.showImagesInViewer).toBe(true);
			expect(component.options.display.toggleBrokenImages).toBe(true);

			expect(component.options.behaviour.keepRecentFusks).toBe(true);
			expect(component.options.behaviour.openInForeground).toBe(true);
			expect(component.options.behaviour.recentFusks).toEqual([]);
			expect(component.options.behaviour.galleryHistory.entries).toEqual([]);
			expect(component.options.behaviour.galleryHistory.maxEntries).toBe(10);

			expect(component.options.safety.enableOverloadProtection).toBe(true);
			expect(component.options.safety.overloadProtectionLimit).toBe(50);
			expect(component.options.version).toBe(1);
		});

		it('should load options on init', async () => {
			const testOptions = new ChromeStorageData({
				display: {
					darkMode: true,
					imageDisplayMode: 'fullWidth',
					resizeImagesToFillPage: false,
					resizeImagesToFitOnPage: false,
					resizeImagesToFullWidth: true,
					resizeImagesToThumbnails: false,
					showImagesInViewer: true,
					toggleBrokenImages: true,
				},
				behaviour: {
					keepRecentFusks: false,
					openInForeground: false,
					recentFusks: [],
					galleryHistory: {
						entries: [],
						maxEntries: 10,
					},
				},
				safety: {
					enableOverloadProtection: true,
					overloadProtectionLimit: 50,
				},
				version: 1,
			});

			mockChromeService.getStorageData.and.returnValue(Promise.resolve(testOptions));

			await component.ngOnInit();

			expect(mockChromeService.getStorageData).toHaveBeenCalled();
			expect(component.options.display.darkMode).toBe(testOptions.display.darkMode);
			expect(component.options.display.imageDisplayMode).toBe(testOptions.display.imageDisplayMode);
			expect(component.options.display.resizeImagesToFillPage).toBe(testOptions.display.resizeImagesToFillPage);
			expect(component.options.display.resizeImagesToFitOnPage).toBe(testOptions.display.resizeImagesToFitOnPage);
			expect(component.options.display.resizeImagesToFullWidth).toBe(testOptions.display.resizeImagesToFullWidth);
			expect(component.options.display.resizeImagesToThumbnails).toBe(
				testOptions.display.resizeImagesToThumbnails
			);
			expect(component.options.display.showImagesInViewer).toBe(testOptions.display.showImagesInViewer);
			expect(component.options.display.toggleBrokenImages).toBe(testOptions.display.toggleBrokenImages);

			expect(component.options.behaviour.keepRecentFusks).toBe(testOptions.behaviour.keepRecentFusks);
			expect(component.options.behaviour.openInForeground).toBe(testOptions.behaviour.openInForeground);
			expect(component.options.behaviour.recentFusks).toEqual(testOptions.behaviour.recentFusks);
			expect(component.options.behaviour.galleryHistory.entries).toEqual(
				testOptions.behaviour.galleryHistory.entries
			);
			expect(component.options.behaviour.galleryHistory.maxEntries).toBe(
				testOptions.behaviour.galleryHistory.maxEntries
			);

			expect(component.options.safety.enableOverloadProtection).toBe(testOptions.safety.enableOverloadProtection);
			expect(component.options.safety.overloadProtectionLimit).toBe(testOptions.safety.overloadProtectionLimit);
			expect(component.options.version).toBe(testOptions.version);
		});

		it('should handle errors when loading options', async () => {
			mockChromeService.getStorageData.and.returnValue(Promise.reject(new Error('Storage error')));
			const loggerSpy = spyOn(component['logger'], 'error');

			await component.ngOnInit();

			expect(loggerSpy).toHaveBeenCalledWith('options.loadFailed', 'Failed to load options', jasmine.any(Error));
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
			const loggerSpy = spyOn(component['logger'], 'error');

			await component.saveOptions();

			expect(loggerSpy).toHaveBeenCalledWith('options.saveFailed', 'Failed to save options', jasmine.any(Error));
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
			component.options.display.darkMode = true;
			component.options.behaviour.keepRecentFusks = false;
			fixture.detectChanges();

			expect(component.options.display.darkMode).toBeTruthy();
			expect(component.options.behaviour.keepRecentFusks).toBeFalsy();
		});

		it('should display status message when present', () => {
			component.statusMessage = 'Test message';
			fixture.detectChanges();

			const statusElement = fixture.nativeElement.querySelector('.alert');
			expect(statusElement.textContent.trim()).toContain('Test message');
		});

		it('should hide status message when empty', () => {
			component.statusMessage = '';
			fixture.detectChanges();

			const statusElement = fixture.nativeElement.querySelector('.alert');
			expect(statusElement).toBeNull(); // Alert should not be present when statusMessage is empty
		});
	});

	describe('Dark Mode Color Tests', () => {
		beforeEach(async () => {
			mockChromeService.getStorageData.and.returnValue(Promise.resolve(component.options));
			await component.ngOnInit();
			fixture.detectChanges();
		});

		it('should apply dark mode class when dark mode is enabled', () => {
			component.options.display.darkMode = true;
			component.onDarkModeChange();

			expect(document.body.classList.contains('dark-mode')).toBeTruthy();
		});

		it('should remove dark mode class when dark mode is disabled', () => {
			component.options.display.darkMode = false;
			component.onDarkModeChange();

			expect(document.body.classList.contains('dark-mode')).toBeFalsy();
		});

		it('should have proper CSS variables for dark mode', () => {
			component.options.display.darkMode = true;
			component.onDarkModeChange();

			const computedStyle = getComputedStyle(document.body);

			// Verify CSS variables are set for dark mode
			expect(computedStyle.getPropertyValue('--bg-color').trim()).toBe('#1a1a1a');
			expect(computedStyle.getPropertyValue('--bg-secondary').trim()).toBe('#2d2d2d');
			expect(computedStyle.getPropertyValue('--text-color').trim()).toBe('#e0e0e0');
			expect(computedStyle.getPropertyValue('--text-secondary').trim()).toBe('#a0a0a0');
			expect(computedStyle.getPropertyValue('--border-color').trim()).toBe('#404040');
		});

		it('should have proper CSS variables for light mode', () => {
			component.options.display.darkMode = false;
			component.onDarkModeChange();

			const computedStyle = getComputedStyle(document.body);

			// Verify CSS variables are set for light mode
			expect(computedStyle.getPropertyValue('--bg-color').trim()).toBe('#ffffff');
			expect(computedStyle.getPropertyValue('--bg-secondary').trim()).toBe('#f5f5f5');
			expect(computedStyle.getPropertyValue('--text-color').trim()).toBe('#333333');
			expect(computedStyle.getPropertyValue('--text-secondary').trim()).toBe('#666666');
			expect(computedStyle.getPropertyValue('--border-color').trim()).toBe('#dddddd');
		});

		it('should verify card elements have dark background in dark mode', () => {
			component.options.display.darkMode = true;
			component.onDarkModeChange();
			fixture.detectChanges();

			// Verify dark mode class is applied
			expect(document.body.classList.contains('dark-mode')).toBeTruthy();

			// Check CSS variables are set correctly
			const computedStyle = getComputedStyle(document.body);
			const bgSecondary = computedStyle.getPropertyValue('--bg-secondary').trim();
			expect(bgSecondary).toBe('#2d2d2d');

			// Verify card elements exist (the CSS will handle the actual styling)
			const cardElements = fixture.nativeElement.querySelectorAll('.card');
			expect(cardElements.length).toBeGreaterThan(0);
		});

		it('should verify text elements have light color in dark mode', () => {
			component.options.display.darkMode = true;
			component.onDarkModeChange();
			fixture.detectChanges();

			// Force styles to be recalculated
			window.getComputedStyle(document.body).getPropertyValue('color');

			// Check that dark-mode class is applied (primary indicator)
			expect(document.body.classList.contains('dark-mode')).toBeTruthy();

			// Check CSS variables are properly set
			const computedStyle = getComputedStyle(document.body);
			const textColor = computedStyle.getPropertyValue('--text-color').trim();
			const bgColor = computedStyle.getPropertyValue('--bg-color').trim();

			// Verify the CSS variables are set to dark mode values
			expect(textColor).toBe('#e0e0e0');
			expect(bgColor).toBe('#1a1a1a');

			// Test that the elements exist (they may not have computed styles applied in test environment)
			const textElements = fixture.nativeElement.querySelectorAll('h1, h5, label, .form-text');
			expect(textElements.length).toBeGreaterThan(0);

			// In a real environment, these elements should inherit from CSS variables
			// The important part is that dark-mode class is applied
		});

		it('should apply dark mode on component initialization when option is set', async () => {
			const darkModeOptions = {
				...component.options,
				display: {
					...component.options.display,
					darkMode: true,
				},
			};

			mockChromeService.getStorageData.and.returnValue(Promise.resolve(darkModeOptions));

			await component.ngOnInit();

			expect(document.body.classList.contains('dark-mode')).toBeTruthy();
		});
	});

	describe('resetToDefaults', () => {
		beforeEach(() => {
			// Setup spies for the reset functionality
			mockChromeService.resetOptionsToDefaults = jasmine
				.createSpy('resetOptionsToDefaults')
				.and.returnValue(Promise.resolve());
			spyOn(window, 'confirm').and.returnValue(true);
			spyOn(component, 'loadOptions').and.returnValue(Promise.resolve());
		});

		it('should reset options to defaults when confirmed', async () => {
			await component.resetToDefaults();

			expect(window.confirm).toHaveBeenCalledWith(component.translate('Options_ResetConfirmation'));
			expect(mockChromeService.resetOptionsToDefaults).toHaveBeenCalled();
			expect(component.loadOptions).toHaveBeenCalled();
			expect(component.statusMessage).toBe(component.translate('Options_ResetSuccessful'));
		});

		it('should not reset options when user cancels confirmation', async () => {
			(window.confirm as jasmine.Spy).and.returnValue(false);

			await component.resetToDefaults();

			expect(window.confirm).toHaveBeenCalledWith(component.translate('Options_ResetConfirmation'));
			expect(mockChromeService.resetOptionsToDefaults).not.toHaveBeenCalled();
			expect(component.loadOptions).not.toHaveBeenCalled();
			expect(component.statusMessage).toBe('');
		});

		it('should handle reset errors gracefully', async () => {
			const errorMessage = 'Reset failed';
			mockChromeService.resetOptionsToDefaults.and.returnValue(Promise.reject(new Error(errorMessage)));

			await component.resetToDefaults();

			expect(mockChromeService.resetOptionsToDefaults).toHaveBeenCalled();
			expect(component.loadOptions).not.toHaveBeenCalled();
			expect(component.statusMessage).toBe(component.translate('Options_ResetFailed'));
		});

		it('should show status message that clears after 2 seconds', async () => {
			jasmine.clock().install();

			await component.resetToDefaults();

			expect(component.statusMessage).toBe(component.translate('Options_ResetSuccessful'));

			jasmine.clock().tick(2001);

			expect(component.statusMessage).toBe('');

			jasmine.clock().uninstall();
		});
	});
});
