import { Injectable } from '@angular/core';

export interface ChromeStorageData {
	darkMode?: boolean;
	keepRecentFusks?: boolean;
	openInForeground?: boolean;
	recentFusks?: string[];
	// Image resize options
	resizeImagesToFitOnPage?: boolean;
	resizeImagesToFullWidth?: boolean;
	resizeImagesToFillPage?: boolean;
	resizeImagesToThumbnails?: boolean;
	// Image viewer options
	showImagesInViewer?: boolean;
	toggleBrokenImages?: boolean;
	// Image display mode (fitOnPage, fullWidth, fillPage, thumbnails)
	imageDisplayMode?: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails';
}

// Cross-browser compatibility
declare var browser: any;
declare var chrome: any;

@Injectable({
	providedIn: 'root'
})
export class ChromeService {
	private browserAPI: any;

	constructor() {
		// Prefer browser API for Firefox, fallback to chrome for Chrome
		this.browserAPI = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);
	}

	async getStorageData(): Promise<ChromeStorageData> {
		return new Promise((resolve) => {
			if (this.browserAPI && this.browserAPI.storage) {
				this.browserAPI.storage.sync.get(null, (data: ChromeStorageData) => {
					resolve(data);
				});
			} else {
				// Fallback for development
				resolve({
					darkMode: false,
					openInForeground: true,
					keepRecentFusks: true,
					recentFusks: []
				});
			}
		});
	}

	async setStorageData(data: Partial<ChromeStorageData>): Promise<void> {
		return new Promise((resolve) => {
			if (this.browserAPI && this.browserAPI.storage) {
				this.browserAPI.storage.sync.set(data, () => {
					resolve();
				});
			} else {
				// Fallback for development
				console.log('Setting storage data:', data);
				resolve();
			}
		});
	}

	async openTab(url: string, active: boolean = true): Promise<void> {
		return new Promise((resolve) => {
			if (this.browserAPI && this.browserAPI.tabs) {
				this.browserAPI.tabs.create({ url, active }, () => {
					resolve();
				});
			} else {
				// Fallback for development
				window.open(url, '_blank');
				resolve();
			}
		});
	}

	async getCurrentTab(): Promise<any> {
		return new Promise((resolve) => {
			if (this.browserAPI && this.browserAPI.tabs) {
				this.browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
					resolve(tabs[0] || null);
				});
			} else {
				resolve(null);
			}
		});
	}

	async downloadFile(url: string, filename?: string): Promise<void> {
		return new Promise((resolve) => {
			if (this.browserAPI && this.browserAPI.downloads) {
				this.browserAPI.downloads.download({
					url,
					filename: filename || undefined
				}, () => {
					resolve();
				});
			} else {
				// Fallback for development
				const link = document.createElement('a');
				link.href = url;
				if (filename) {
					link.download = filename;
				}
				link.click();
				resolve();
			}
		});
	}

	isExtensionContext(): boolean {
		return !!(this.browserAPI && this.browserAPI.runtime && this.browserAPI.runtime.id);
	}
}
