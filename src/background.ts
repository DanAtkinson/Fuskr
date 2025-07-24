/// <reference types="chrome"/>

import { FuskrService } from './app/services/fuskr.service';
import { ChromeStorageData } from './app/models/chrome-storage/chrome-storage-data.model';

// Background script for Chrome extension
// This runs as a service worker in Manifest V3

class BackgroundScript {
	private fuskrService = new FuskrService();
	private historyIds: Array<[string, string]> = [];
	private recentId: string | null = null;
	private parentId: string | null = null;

	private options: ChromeStorageData = new ChromeStorageData();

	constructor() {
		this.initialize();
	}

	private initialize(): void {
		this.setupEventListeners();
		this.loadOptions();
		// Ensure context menus are created when service worker starts
		this.createContextMenus();
	}

	private setupEventListeners(): void {
		// Installation and update handling
		chrome.runtime.onInstalled.addListener((details) => {
			this.handleInstallation(details);
		});

		// Service worker startup - ensure context menus exist
		chrome.runtime.onStartup.addListener(() => {
			this.createContextMenus();
		});

		// Storage changes
		chrome.storage.onChanged.addListener((changes) => {
			this.handleStorageChanges(changes);
		});

		// Context menu clicks
		chrome.contextMenus.onClicked.addListener((info, tab) => {
			this.handleContextMenuClick(info, tab);
		});

		// Omnibox input
		chrome.omnibox.onInputEntered.addListener((text) => {
			this.handleOmniboxInput(text);
		});
	}

	private l18nify(name: string): string {
		return chrome.i18n.getMessage('Application_' + name);
	}

	private createRecentMenu(historyArray: string[]): void {
		if (this.recentId) {
			chrome.contextMenus.remove(this.recentId);
			this.recentId = null;
		}

		this.historyIds = [];

		if (!historyArray || historyArray.length === 0) {
			return;
		}

		this.recentId = this.createContextMenu({
			Id: 'FuskrRecent',
			ParentId: 'FuskrContextMenu',
			Title: this.l18nify('ContextMenu_Recent')
		});

		for (let i = 0; i < historyArray.length; i++) {
			if (historyArray[i] !== '') {
				const historyId = this.createContextMenu({
					Id: `FuskrHistory_${i}`,
					ParentId: this.recentId,
					Title: historyArray[i]
				});
				this.historyIds.push([historyId, historyArray[i]]);
			}
		}

		if (historyArray.length > 0) {
			this.createContextMenu({
				Id: 'FuskrSeparator3',
				ParentId: this.recentId,
				ItemType: 'separator'
			});
			this.createContextMenu({
				Id: 'FuskrClearHistory',
				ParentId: this.recentId,
				Title: this.l18nify('ContextMenu_ClearRecentActivity')
			});
		}
	}

	private createContextMenu(obj: {
		Context?: string[];
		Id: string;
		ItemType?: 'normal' | 'checkbox' | 'radio' | 'separator';
		ParentId?: string | null;
		TargetUrlPatterns?: string[];
		Title?: string;
	}): string {
		return chrome.contextMenus.create({
			contexts: obj.Context as chrome.contextMenus.ContextType[] || ['all'],
			id: obj.Id,
			parentId: obj.ParentId || undefined,
			targetUrlPatterns: obj.TargetUrlPatterns || undefined,
			title: obj.Title,
			type: obj.ItemType || 'normal'
		}) as string;
	}

	private createContextMenus(): void {
		// Target URLs for numeric patterns
		const targetUrls: string[] = [];
		for (let i = 0; i <= 9; i++) {
			targetUrls.push(`*://*/*${i}*`);
		}

		// Clear existing menus first
		chrome.contextMenus.removeAll(() => {
			// Create new menus after clearing
			try {
				this.parentId = this.createContextMenu({
					Context: ['all'],
					Id: 'FuskrContextMenu',
					Title: this.l18nify('ContextMenu_Fusk'),
				});

				const incDecMenuId = this.createContextMenu({
					Context: ['image', 'video', 'audio', 'link'],
					Id: 'FuskrIncrementDecrement',
					ParentId: this.parentId,
					TargetUrlPatterns: targetUrls,
					Title: '+/-',
				});

				const incMenuId = this.createContextMenu({
					Context: ['image', 'video', 'audio', 'link'],
					Id: 'FuskrIncrement',
					ParentId: this.parentId,
					TargetUrlPatterns: targetUrls,
					Title: '+',
				});

				const decMenuId = this.createContextMenu({
					Context: ['image', 'video', 'audio', 'link'],
					Id: 'FuskrDecrement',
					ParentId: this.parentId,
					TargetUrlPatterns: targetUrls,
					Title: '-',
				});

				const numbers = [
					this.l18nify('ContextMenu_10'),
					this.l18nify('ContextMenu_20'),
					this.l18nify('ContextMenu_50'),
					this.l18nify('ContextMenu_100'),
					this.l18nify('ContextMenu_200'),
					this.l18nify('ContextMenu_500'),
					this.l18nify('ContextMenu_Other')
				];

				for (const number of numbers) {
					this.createContextMenu({
						Context: ['image', 'video', 'audio', 'link'],
						Id: `Fuskr_IncDec_${number}_Zero`,
						ParentId: incDecMenuId,
						Title: number,
					});
					this.createContextMenu({
						Context: ['image', 'video', 'audio', 'link'],
						Id: `Fuskr_IncDec_${number}_One`,
						ParentId: incMenuId,
						Title: number,
					});
					this.createContextMenu({
						Context: ['image', 'video', 'audio', 'link'],
						Id: `Fuskr_IncDec_${number}_NegOne`,
						ParentId: decMenuId,
						Title: number,
					});
				}

				this.createContextMenu({
					Context: ['image', 'video', 'audio', 'link'],
					Id: 'FuskrSeparator1',
					ItemType: 'separator',
					ParentId: this.parentId,
				});

				this.createContextMenu({
					Context: ['selection'],
					Id: 'FuskrCreateFromSelection',
					ParentId: this.parentId,
					Title: this.l18nify('ContextMenu_CreateFromSelection'),
				});

				this.createContextMenu({
					Id: 'FuskrManual',
					ParentId: this.parentId,
					Title: this.l18nify('ContextMenu_Manual'),
				});

				this.createContextMenu({
					Id: 'FuskrSeparator2',
					ItemType: 'separator',
					ParentId: this.parentId,
				});

				this.createContextMenu({
					Id: 'FuskrHistory',
					ParentId: this.parentId,
					Title: this.l18nify('ContextMenu_History'),
				});

				this.createContextMenu({
					Id: 'FuskrOptions',
					ParentId: this.parentId,
					Title: this.l18nify('ContextMenu_Options'),
				});
			} catch (error) {
				console.error('Error creating context menus:', error);
			}
		});
	}

	private createTab(url: string, tab: chrome.tabs.Tab): void {
		if (!url || url.length === 0) {
			return;
		}

		this.addUrlToHistory(url, tab);

		chrome.tabs.create({
			active: this.options.behaviour.openInForeground,
			index: (tab.index || 0) + 1,
			url: `index.html#gallery?url=${encodeURIComponent(url)}`,
			windowId: tab.windowId,
		});
	}

	private addUrlToHistory(url: string, tab: chrome.tabs.Tab): void {
		if (tab.incognito || !this.options.behaviour.keepRecentFusks) {
			return;
		}

		const newHistory = [...this.options.behaviour.recentFusks, url].slice(-10);

		chrome.storage.sync.set({ behaviour: { ...this.options.behaviour, recentFusks: newHistory } });

		if (this.options.behaviour.keepRecentFusks) {
			this.createRecentMenu(newHistory);
		}
	}

	private handleInstallation(details: chrome.runtime.InstalledDetails): void {
		if (details.reason === 'install') {
			const defaultData = new ChromeStorageData();
			chrome.storage.sync.set(defaultData);
		} else if (details.reason === 'update') {
			// Note: localStorage is not available in service workers (Manifest V3)
			// Legacy migration is no longer needed for new installs
			// Existing users will need to reconfigure their settings
		}

		this.createContextMenus();
	}

	private handleStorageChanges(changes: { [key: string]: chrome.storage.StorageChange }): void {
		if (!changes) return;

		// Update the entire options object with new data
		if (changes['display']) {
			this.options.display = { ...this.options.display, ...changes['display'].newValue };
		}
		if (changes['behaviour']) {
			this.options.behaviour = { ...this.options.behaviour, ...changes['behaviour'].newValue };
		}
		if (changes['safety']) {
			this.options.safety = { ...this.options.safety, ...changes['safety'].newValue };
		}
		if (changes['version']) {
			this.options.version = changes['version'].newValue;
		}

		// Handle recent menu updates
		if (changes['behaviour'] &&
			changes['behaviour'].newValue?.keepRecentFusks !== changes['behaviour'].oldValue?.keepRecentFusks) {
			if (changes['behaviour'].newValue?.keepRecentFusks) {
				this.createRecentMenu(this.options.behaviour.recentFusks);
			} else {
				this.createRecentMenu([]);
			}
		}
	}

	private loadOptions(): void {
		chrome.storage.sync.get(null, (items) => {
			if (items) {
				// Update with the new nested structure
				if (items['display']) {
					this.options.display = { ...this.options.display, ...items['display'] };
				}
				if (items['behaviour']) {
					this.options.behaviour = { ...this.options.behaviour, ...items['behaviour'] };
				}
				if (items['safety']) {
					this.options.safety = { ...this.options.safety, ...items['safety'] };
				}
				if (items['version']) {
					this.options.version = items['version'];
				}
			}
		});
	}

	private handleContextMenuClick(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab): void {
		if (!tab) return;

		switch (info.menuItemId) {
			case 'FuskrContextMenu':
			case 'FuskrDecrement':
			case 'FuskrIncrement':
			case 'FuskrIncrementDecrement':
			case 'FuskrRecent':
			case 'FuskrSeparator1':
			case 'FuskrSeparator2':
			case 'FuskrSeparator3':
				return;
			case 'FuskrCreateFromSelection':
				this.createFromSelectionOnClick(info, tab);
				return;
			case 'FuskrManual':
				this.manualOnClick(info, tab);
				return;
			case 'FuskrClearHistory':
				this.clearRecentOnClick();
				return;
			case 'FuskrHistory':
				this.historyOnClick();
				return;
			case 'FuskrOptions':
				this.optionsOnClick();
				return;
		}

		if (typeof info.menuItemId === 'string') {
			if (info.menuItemId.includes('Fuskr_IncDec_')) {
				this.choiceOnClick(info, tab);
				return;
			}

			if (info.menuItemId.includes('FuskrHistory_')) {
				this.recentOnClick(info, tab);
				return;
			}
		}
	}

	private createFromSelectionOnClick(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): void {
		const url = info.selectionText;
		if (!url) return;

		if (!this.fuskrService.isFuskable(url)) {
			alert(this.l18nify('Prompt_NotAValidFusk'));
			return;
		}

		this.createTab(url, tab);
	}

	private manualOnClick(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): void {
		// For manual mode, use the URL from context (if available) or the current tab URL
		// This allows users to manually enter a URL or use the current page URL as a starting point
		let targetUrl = '';

		// Try to get URL from context first (if clicked on a link or image)
		if (info.linkUrl && this.isValidWebUrl(info.linkUrl)) {
			targetUrl = info.linkUrl;
		} else if (info.srcUrl && this.isValidWebUrl(info.srcUrl)) {
			targetUrl = info.srcUrl;
		} else if (tab.url && this.isValidWebUrl(tab.url)) {
			// Use the current tab URL if it's a valid web URL
			targetUrl = tab.url;
		}

		if (targetUrl && targetUrl.trim()) {
			// Pass the target URL to createTab which will handle the extension URL construction
			this.createTab(targetUrl, tab);
		} else {
			// If no valid URL available, open gallery in manual mode without pre-filling
			chrome.tabs.create({
				active: this.options.behaviour.openInForeground,
				index: (tab.index || 0) + 1,
				url: chrome.runtime.getURL('index.html'),
				windowId: tab.windowId,
			});
		}
	}

	/**
	 * Check if a URL is a valid web URL (HTTP/HTTPS/FILE)
	 * Filters out browser-specific protocols like chrome://, edge://, firefox://, etc.
	 */
	private isValidWebUrl(url: string): boolean {
		if (!url || typeof url !== 'string') {
			return false;
		}

		// Allow HTTP, HTTPS, and FILE protocols
		return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://');
	}

	private clearRecentOnClick(): void {
		this.createRecentMenu([]);
		chrome.storage.sync.set({ history: [] });
	}

	private optionsOnClick(): void {
		chrome.runtime.openOptionsPage();
	}

	private historyOnClick(): void {
		chrome.tabs.create({
			url: chrome.runtime.getURL('index.html#/history'),
		});
	}

	private choiceOnClick(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): void {
		const url = info.linkUrl || info.srcUrl;
		if (!url) {
			alert(this.l18nify('Prompt_NotAValidFusk'));
			return;
		}

		const menuItemRegexp = /^Fuskr_IncDec_(.+)_(NegOne|Zero|One)$/;
		const menuItemInfo = (info.menuItemId as string).match(menuItemRegexp);

		if (!menuItemInfo || menuItemInfo.length !== 3) {
			alert(this.l18nify('Prompt_NotAValidFusk'));
			return;
		}

		let count: number;
		if (menuItemInfo[1] === this.l18nify('ContextMenu_Other')) {
			const response = prompt(this.l18nify('Prompt_HowMany'));
			if (!response || isNaN(parseInt(response, 10))) {
				alert(this.l18nify('Prompt_NotAValidNumber'));
				return;
			}
			count = parseInt(response, 10);
		} else {
			// Extract number from localized string
			const numberMatch = menuItemInfo[1].match(/\d+/);
			if (!numberMatch) {
				alert(this.l18nify('Prompt_NotAValidNumber'));
				return;
			}
			count = parseInt(numberMatch[0], 10);
		}

		let direction: number;
		switch (menuItemInfo[2]) {
			case 'One': direction = 1; break;
			case 'Zero': direction = 0; break;
			case 'NegOne': direction = -1; break;
			default:
				alert(this.l18nify('Prompt_NotAValidFusk'));
				return;
		}

		try {
			const fuskUrl = this.fuskrService.createFuskUrl(url, count, direction);
			this.createTab(fuskUrl, tab);
		} catch (error) {
			alert(this.l18nify('Prompt_NotAValidFusk'));
		}
	}

	private recentOnClick(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): void {
		const historyMatch = (info.menuItemId as string).match(/^FuskrHistory_(\d+)$/);
		if (!this.historyIds.length || !historyMatch || historyMatch.length !== 2) {
			alert(this.l18nify('Prompt_NotAValidFusk'));
			return;
		}

		const historyIndex = parseInt(historyMatch[1], 10);
		if (isNaN(historyIndex) || historyIndex < 0 || this.historyIds.length <= historyIndex) {
			alert(this.l18nify('Prompt_NotAValidFusk'));
			return;
		}

		this.createTab(this.historyIds[historyIndex][1], tab);
	}

	private handleOmniboxInput(text: string): void {
		chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
			if (tabs[0]) {
				this.createTab(text, tabs[0]);
			}
		});
	}
}

// Initialize the background script
new BackgroundScript();
