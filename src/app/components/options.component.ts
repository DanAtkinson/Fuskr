import { Component, OnInit } from '@angular/core';
import { ChromeStorageData } from '@services/chrome.service';
import { LoggerService, LogLevel } from '@services/logger.service';
import { BaseComponent } from './base.component';

@Component({
	selector: 'app-options',
	standalone: false,
	styleUrls: ['./options.component.scss'],
	templateUrl: './options.component.html',
})
export class OptionsComponent extends BaseComponent implements OnInit {
	options: ChromeStorageData = {
		version: 1,
		display: {
			darkMode: false,
			imageDisplayMode: 'fitOnPage',
			resizeImagesToFitOnPage: true,
			resizeImagesToFullWidth: false,
			resizeImagesToFillPage: false,
			resizeImagesToThumbnails: false,
			showImagesInViewer: true,
			toggleBrokenImages: true,
		},
		behavior: {
			keepRecentFusks: true,
			openInForeground: true,
			recentFusks: [],
		},
		safety: {
			enableOverloadProtection: true,
			overloadProtectionLimit: 50,
		}
	};

	statusMessage = '';

	// Debug/logging properties
	showDebugPanel = false;
	loggerConfig: any = {};

	constructor(private logger: LoggerService) {
		super();
	}

	async ngOnInit() {
		await this.loadOptions();
		this.loggerConfig = this.logger.getConfig();
	}

	async loadOptions() {
		try {
			this.options = await this.chromeService.getStorageData();
			// Apply dark mode class to document
			document.body.classList.toggle('dark-mode', this.options.display.darkMode);
			this.logger.debug('options.loaded', 'Options loaded successfully');
		} catch (error) {
			this.logger.error('options.loadFailed', 'Failed to load options', error);
		}
	}

	async saveOptions() {
		try {
			await this.chromeService.setStorageData(this.options);
			this.showStatus(this.translate('Options_SettingsSaved'));
			this.logger.info('options.saved', 'User saved options');
		} catch (error) {
			this.logger.error('options.saveFailed', 'Failed to save options', error);
			this.showStatus(this.translate('Options_ErrorSaving'));
		}
	}

	private showStatus(message: string) {
		this.statusMessage = message;
		setTimeout(() => {
			this.statusMessage = '';
		}, 2000);
	}

	onDarkModeChange() {
		// Apply dark mode change immediately
		document.body.classList.toggle('dark-mode', this.options.display.darkMode);
	}

	// Debug/logging methods
	toggleDebugPanel() {
		this.showDebugPanel = !this.showDebugPanel;
		this.logger.debug('options.debugPanel.toggled', `Panel visibility: ${this.showDebugPanel}`);
		if (this.showDebugPanel) {
			this.loggerConfig = this.logger.getConfig();
		}
	}

	exportLogs() {
		this.logger.exportLogs();
		this.logger.info('options.debugPanel.exported', 'User exported debug logs');
		this.showStatus('Debug logs exported!');
	}

	clearLogs() {
		this.logger.clearLogs();
		this.loggerConfig = this.logger.getConfig();
		this.logger.info('options.debugPanel.cleared', 'User cleared debug logs');
		this.showStatus('Debug logs cleared!');
	}

	getLogLevelName(level: number): string {
		return LogLevel[level] || 'Unknown';
	}
}
