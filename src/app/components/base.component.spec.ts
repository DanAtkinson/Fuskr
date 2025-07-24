import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseComponent } from './base.component';
import { ChromeService } from '@services/chrome.service';

// Create a concrete test component that extends BaseComponent
@Component({
	template: '<div>Test Component</div>',
	standalone: false
})
class TestBaseComponent extends BaseComponent { }

describe('BaseComponent', () => {
	let component: TestBaseComponent;
	let fixture: ComponentFixture<TestBaseComponent>;
	let mockChromeService: jasmine.SpyObj<ChromeService>;

	beforeEach(async () => {
		const chromeServiceSpy = jasmine.createSpyObj('ChromeService', ['getMessage']);

		await TestBed.configureTestingModule({
			declarations: [TestBaseComponent],
			providers: [
				{ provide: ChromeService, useValue: chromeServiceSpy }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(TestBaseComponent);
		component = fixture.componentInstance;
		mockChromeService = TestBed.inject(ChromeService) as jasmine.SpyObj<ChromeService>;
		fixture.detectChanges();
	});

	describe('Component Creation', () => {
		it('should create', () => {
			expect(component).toBeTruthy();
		});

		it('should extend BaseComponent', () => {
			expect(component).toBeInstanceOf(BaseComponent);
		});

		it('should have chromeService injected', () => {
			expect(component['chromeService']).toBeTruthy();
			expect(component['chromeService']).toBe(mockChromeService);
		});
	});

	describe('translate() method', () => {
		it('should call chromeService.getMessage with key only', () => {
			const testKey = 'test_key';
			const expectedMessage = 'Test Message';

			mockChromeService.getMessage.and.returnValue(expectedMessage);

			const result = component.translate(testKey);

			expect(mockChromeService.getMessage).toHaveBeenCalledWith(testKey, undefined);
			expect(result).toBe(expectedMessage);
		});

		it('should call chromeService.getMessage with key and substitutions', () => {
			const testKey = 'test_key_with_subs';
			const testSubstitutions = ['value1', 'value2'];
			const expectedMessage = 'Test Message with value1 and value2';

			mockChromeService.getMessage.and.returnValue(expectedMessage);

			const result = component.translate(testKey, testSubstitutions);

			expect(mockChromeService.getMessage).toHaveBeenCalledWith(testKey, testSubstitutions);
			expect(result).toBe(expectedMessage);
		});

		it('should handle empty substitutions array', () => {
			const testKey = 'test_empty_subs';
			const testSubstitutions: string[] = [];
			const expectedMessage = 'Empty substitutions message';

			mockChromeService.getMessage.and.returnValue(expectedMessage);

			const result = component.translate(testKey, testSubstitutions);

			expect(mockChromeService.getMessage).toHaveBeenCalledWith(testKey, testSubstitutions);
			expect(result).toBe(expectedMessage);
		});

		it('should handle undefined substitutions', () => {
			const testKey = 'test_undefined_subs';
			const expectedMessage = 'Undefined substitutions message';

			mockChromeService.getMessage.and.returnValue(expectedMessage);

			const result = component.translate(testKey, undefined);

			expect(mockChromeService.getMessage).toHaveBeenCalledWith(testKey, undefined);
			expect(result).toBe(expectedMessage);
		});

		it('should handle special characters in key', () => {
			const testKey = 'test_key_with_special-chars.123';
			const expectedMessage = 'Special chars message';

			mockChromeService.getMessage.and.returnValue(expectedMessage);

			const result = component.translate(testKey);

			expect(mockChromeService.getMessage).toHaveBeenCalledWith(testKey, undefined);
			expect(result).toBe(expectedMessage);
		});

		it('should handle multiple substitutions', () => {
			const testKey = 'multi_substitution_key';
			const testSubstitutions = ['first', 'second', 'third', 'fourth'];
			const expectedMessage = 'Message with first, second, third, and fourth';

			mockChromeService.getMessage.and.returnValue(expectedMessage);

			const result = component.translate(testKey, testSubstitutions);

			expect(mockChromeService.getMessage).toHaveBeenCalledWith(testKey, testSubstitutions);
			expect(result).toBe(expectedMessage);
		});
	});

	describe('Error Handling', () => {
		it('should handle chromeService.getMessage throwing error', () => {
			const testKey = 'error_key';

			mockChromeService.getMessage.and.throwError('Translation error');

			expect(() => {
				component.translate(testKey);
			}).toThrowError('Translation error');
		});

		it('should handle chromeService.getMessage returning null', () => {
			const testKey = 'null_key';

			mockChromeService.getMessage.and.returnValue(null as any);

			const result = component.translate(testKey);

			expect(result).toBeNull();
		});

		it('should handle chromeService.getMessage returning undefined', () => {
			const testKey = 'undefined_key';

			mockChromeService.getMessage.and.returnValue(undefined as any);

			const result = component.translate(testKey);

			expect(result).toBeUndefined();
		});
	});

	describe('ChromeService Integration', () => {
		it('should maintain chromeService reference', () => {
			expect(component['chromeService']).toBe(mockChromeService);
		});

		it('should access chromeService through protected property', () => {
			// Test that the chromeService is accessible
			expect(component['chromeService']).toBeDefined();
		});
	});

	describe('Inheritance Behaviour', () => {
		it('should allow subclasses to use translate method', () => {
			const testKey = 'inheritance_test';
			const expectedMessage = 'Inheritance works';

			mockChromeService.getMessage.and.returnValue(expectedMessage);

			const result = component.translate(testKey);

			expect(result).toBe(expectedMessage);
		});

		it('should preserve method functionality in subclass', () => {
			const testKey = 'subclass_test';
			const testSubs = ['sub1', 'sub2'];
			const expectedMessage = 'Subclass message with sub1 and sub2';

			mockChromeService.getMessage.and.returnValue(expectedMessage);

			const result = component.translate(testKey, testSubs);

			expect(mockChromeService.getMessage).toHaveBeenCalledWith(testKey, testSubs);
			expect(result).toBe(expectedMessage);
		});
	});
});
