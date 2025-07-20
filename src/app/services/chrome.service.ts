import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

export interface DisplaySettings {
	darkMode: boolean;
	imageDisplayMode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails';
	resizeImagesToFillPage: boolean;
	resizeImagesToFitOnPage: boolean;
	resizeImagesToFullWidth: boolean;
	resizeImagesToThumbnails: boolean;
	showImagesInViewer: boolean;
	toggleBrokenImages: boolean;
}

export interface BehaviourSettings {
	openInForeground: boolean;
	keepRecentFusks: boolean;
	recentFusks: string[];
}

export interface SafetySettings {
	enableOverloadProtection: boolean;
	overloadProtectionLimit: number;
}

export interface ChromeStorageData {
	behaviour: BehaviourSettings;
	display: DisplaySettings;
	safety: SafetySettings;
	version: number;
}

// Cross-browser compatibility
declare var browser: any;
declare var chrome: any;

@Injectable({
	providedIn: 'root'
})
export class ChromeService {
	private browserAPI: any;

	constructor(private logger: LoggerService) {
		// Prefer browser API for Firefox, fallback to chrome for Chrome
		this.browserAPI = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);
	}

	async getStorageData(): Promise<ChromeStorageData> {
		return new Promise((resolve) => {
			if (this.browserAPI && this.browserAPI.storage) {
				this.browserAPI.storage.sync.get(null, (data: ChromeStorageData) => {
					// Apply defaults to stored data
					const structuredData = this.applyDefaults(data);
					resolve(structuredData);
				});
			} else {
				// Fallback for development
				resolve(this.getDefaultData());
			}
		});
	}

	private applyDefaults(data: Partial<ChromeStorageData>): ChromeStorageData {
		const defaults = this.getDefaultData();

		return {
			version: data.version ?? defaults.version,
			display: { ...defaults.display, ...data.display },
			behaviour: { ...defaults.behaviour, ...data.behaviour },
			safety: { ...defaults.safety, ...data.safety }
		};
	}

	private getDefaultData(): ChromeStorageData {
		return {
			version: 1,
			display: {
				darkMode: false,
				imageDisplayMode: 'fitOnPage',
				resizeImagesToFillPage: false,
				resizeImagesToFitOnPage: true,
				resizeImagesToFullWidth: false,
				resizeImagesToThumbnails: false,
				showImagesInViewer: true,
				toggleBrokenImages: true,
			},
			behaviour: {
				keepRecentFusks: true,
				openInForeground: true,
				recentFusks: [],
			},
			safety: {
				enableOverloadProtection: true,
				overloadProtectionLimit: 500,
			}
		};
	}

	async setStorageData(data: Partial<ChromeStorageData>): Promise<void> {
		return new Promise((resolve) => {
			if (this.browserAPI && this.browserAPI.storage) {
				this.browserAPI.storage.sync.set(data, () => {
					resolve();
				});
			} else {
				// Fallback for development
				this.logger.debug('chrome.storage.fallback', 'Setting storage data in development mode');
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

	getMessage(key: string, substitutions?: string[]): string {
		if (this.browserAPI && this.browserAPI.i18n) {
			return this.browserAPI.i18n.getMessage(key, substitutions) || key;
		} else {
			// Fallback for development - return the key
			return key;
		}
	}

	// Helper methods for easier access to nested settings
	async getDarkMode(): Promise<boolean> {
		const data = await this.getStorageData();
		return data.display.darkMode;
	}

	async getEnableOverloadProtection(): Promise<boolean> {
		const data = await this.getStorageData();
		return data.safety.enableOverloadProtection;
	}

	async getOverloadProtectionLimit(): Promise<number> {
		const data = await this.getStorageData();
		return data.safety.overloadProtectionLimit;
	}

	async getOpenInForeground(): Promise<boolean> {
		const data = await this.getStorageData();
		return data.behaviour.openInForeground;
	}

	async updateDisplaySettings(updates: Partial<DisplaySettings>): Promise<void> {
		const currentData = await this.getStorageData();
		const updatedData = {
			...currentData,
			display: { ...currentData.display, ...updates }
		};
		await this.setStorageData(updatedData);
	}

	async updateBehaviourSettings(updates: Partial<BehaviourSettings>): Promise<void> {
		const currentData = await this.getStorageData();
		const updatedData = {
			...currentData,
			behaviour: { ...currentData.behaviour, ...updates }
		};
		await this.setStorageData(updatedData);
	}

	async updateSafetySettings(updates: Partial<SafetySettings>): Promise<void> {
		const currentData = await this.getStorageData();
		const updatedData = {
			...currentData,
			safety: { ...currentData.safety, ...updates }
		};
		await this.setStorageData(updatedData);
	}
}
