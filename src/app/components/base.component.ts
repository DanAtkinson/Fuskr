import { Component, inject } from '@angular/core';
import { ChromeService } from '../services/chrome.service';

/**
 * Base component that provides common functionality like translation
 */
@Component({
	template: '',
	standalone: false
})
export abstract class BaseComponent {
	protected chromeService = inject(ChromeService);

	/**
	 * Get translated message from chrome.i18n
	 */
	translate(key: string, substitutions?: string[]): string {
		return this.chromeService.getMessage(key, substitutions);
	}
}
