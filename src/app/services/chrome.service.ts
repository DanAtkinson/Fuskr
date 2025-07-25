import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { GalleryHistoryEntry, GalleryHistory } from '@interfaces/gallery-history';
import {
	IChromeStorageData,
	IDisplaySettings,
	IBehaviourSettings,
	ISafetySettings
} from '@interfaces/chrome-storage';
import { ChromeStorageData } from '@models/chrome-storage';

// Cross-browser compatibility
declare var browser: any;
declare var chrome: any;

@Injectable({
	providedIn: 'root'
})
export class ChromeService {
	constructor(private logger: LoggerService) {
		// Prefer browser API for Firefox, fallback to chrome for Chrome
		this.browserAPI = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);
	}

	// Public methods (alphabetically)
	async addGalleryToHistory(entry: Omit<GalleryHistoryEntry, 'id' | 'timestamp'>): Promise<void> {
		const currentData = await this.getStorageData();
		const history = currentData.behaviour.galleryHistory;

		// Create new entry with ID and timestamp as ISO string for reliable storage
		const newEntry: GalleryHistoryEntry = {
			...entry,
			id: this.generateHistoryId(),
			timestamp: new Date().toISOString() as any // Store as ISO string, will be converted back to Date when retrieved
		};

		// Add to beginning of array
		history.entries.unshift(newEntry);

		// Limit to max entries
		if (history.entries.length > history.maxEntries) {
			history.entries = history.entries.slice(0, history.maxEntries);
		}

		// Update storage
		await this.updateBehaviourSettings({ galleryHistory: history });

		this.logger.debug('chrome.history.added', `Added gallery to history: ${entry.originalUrl}`, {
			timestamp: newEntry.timestamp,
			timestampType: typeof newEntry.timestamp
		});
	}

	async clearGalleryHistory(): Promise<void> {
		const emptyHistory: GalleryHistory = {
			entries: [],
			maxEntries: 10
		};
		await this.updateBehaviourSettings({ galleryHistory: emptyHistory });
		this.logger.debug('chrome.history.cleared', 'Gallery history cleared');
	}

	async resetOptionsToDefaults(): Promise<void> {
		try {
			// Get current storage data to preserve history
			const currentData = await this.getStorageData();
			
			// Create new default data with preserved history
			const defaultData = new ChromeStorageData();
			defaultData.behaviour.galleryHistory = currentData.behaviour.galleryHistory;
			
			// Save the reset data
			await this.setStorageData(defaultData);
			this.logger.info('chrome.options.reset', 'Options reset to defaults (history preserved)');
		} catch (error) {
			this.logger.error('chrome.options.resetFailed', 'Failed to reset options', error);
			throw error;
		}
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

	async getDarkMode(): Promise<boolean> {
		const data = await this.getStorageData();
		return data.display.darkMode;
	}

	async getEnableOverloadProtection(): Promise<boolean> {
		const data = await this.getStorageData();
		return data.safety.enableOverloadProtection;
	}

	async getGalleryHistory(): Promise<GalleryHistory> {
		const data = await this.getStorageData();
		const history = data.behaviour.galleryHistory;

		// Convert timestamp strings back to Date objects
		if (history.entries) {
			history.entries = history.entries.map(entry => {
				let validDate: Date;

				// Handle various timestamp formats
				if (entry.timestamp instanceof Date) {
					validDate = entry.timestamp;
				} else if (typeof entry.timestamp === 'string') {
					// ISO string format (new preferred format)
					validDate = new Date(entry.timestamp);
				} else if (typeof entry.timestamp === 'number') {
					validDate = new Date(entry.timestamp);
				} else {
					// Fallback for corrupted/old object format
					this.logger.warn('chrome.getGalleryHistory', 'Invalid timestamp found, using current date', {
						originalTimestamp: entry.timestamp,
						entryId: entry.id
					});
					validDate = new Date();
				}

				// Validate the resulting date
				if (isNaN(validDate.getTime())) {
					this.logger.warn('chrome.getGalleryHistory', 'Created invalid date, using current date', {
						originalTimestamp: entry.timestamp,
						entryId: entry.id
					});
					validDate = new Date();
				}

				return {
					...entry,
					timestamp: validDate
				};
			});
		}

		return history;
	}

	getMessage(key: string, substitutions?: string[]): string {
		if (this.browserAPI && this.browserAPI.i18n) {
			return this.browserAPI.i18n.getMessage(key, substitutions) || key;
		} else {
			// Fallback for development - return the key
			return key;
		}
	}

	async getOpenInForeground(): Promise<boolean> {
		const data = await this.getStorageData();
		return data.behaviour.openInForeground;
	}

	async getOverloadProtectionLimit(): Promise<number> {
		const data = await this.getStorageData();
		return data.safety.overloadProtectionLimit;
	}

	async getStorageData(): Promise<IChromeStorageData> {
		return new Promise((resolve) => {
			if (this.browserAPI && this.browserAPI.storage) {
				this.browserAPI.storage.sync.get(null, (data: IChromeStorageData) => {
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

	isExtensionContext(): boolean {
		return !!(this.browserAPI && this.browserAPI.runtime && this.browserAPI.runtime.id);
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

	async removeGalleryFromHistory(id: string): Promise<void> {
		const currentData = await this.getStorageData();
		const history = currentData.behaviour.galleryHistory;

		history.entries = history.entries.filter((entry: GalleryHistoryEntry) => entry.id !== id);
		await this.updateBehaviourSettings({ galleryHistory: history });

		this.logger.debug('chrome.history.removed', `Removed gallery from history: ${id}`);
	}

	async setStorageData(data: Partial<IChromeStorageData>): Promise<void> {
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

	async updateBehaviourSettings(updates: Partial<IBehaviourSettings>): Promise<void> {
		const currentData = await this.getStorageData();
		const updatedData = {
			...currentData,
			behaviour: { ...currentData.behaviour, ...updates }
		};
		await this.setStorageData(updatedData);
	}

	async updateDisplaySettings(updates: Partial<IDisplaySettings>): Promise<void> {
		const currentData = await this.getStorageData();
		const updatedData = {
			...currentData,
			display: { ...currentData.display, ...updates }
		};
		await this.setStorageData(updatedData);
	}

	async updateSafetySettings(updates: Partial<ISafetySettings>): Promise<void> {
		const currentData = await this.getStorageData();
		const updatedData = {
			...currentData,
			safety: { ...currentData.safety, ...updates }
		};
		await this.setStorageData(updatedData);
	}

	// Private properties (alphabetically)
	private browserAPI: any;

	// Private methods (alphabetically)
	private applyDefaults(data: Partial<IChromeStorageData>): IChromeStorageData {
		return new ChromeStorageData(data);
	}

	private generateHistoryId(): string {
		return `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private getDefaultData(): IChromeStorageData {
		return new ChromeStorageData();
	}
}
