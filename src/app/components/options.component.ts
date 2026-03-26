import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChromeStorageData } from '@models/chrome-storage';
import { LoggerService, LogLevel } from '@services/logger.service';
import { BaseComponent } from './base.component';

@Component({
	selector: 'app-options',
	standalone: true,
	styleUrls: ['./options.component.scss'],
	templateUrl: './options.component.html',
	imports: [CommonModule, FormsModule],
})
export class OptionsComponent extends BaseComponent implements OnInit {
	// Public properties (alphabetically)
	loggerConfig: { enabled: boolean; logLevel: LogLevel; maxLogs: number; logCount: number } = {
		enabled: false,
		logLevel: LogLevel.INFO,
		maxLogs: 0,
		logCount: 0,
	};
	options: ChromeStorageData = new ChromeStorageData();
	showDebugPanel = signal(false);
	statusMessage = signal('');

	// Injected services
	private logger = inject(LoggerService);

	constructor() {
		super();
	}

	// Public methods (alphabetically)
	clearLogs() {
		this.logger.clearLogs();
		this.loggerConfig = this.logger.getConfig();
		this.logger.info('options.debugPanel.cleared', 'User cleared debug logs');
		this.showStatus('Debug logs cleared!');
	}

	exportLogs() {
		this.logger.exportLogs();
		this.logger.info('options.debugPanel.exported', 'User exported debug logs');
		this.showStatus('Debug logs exported!');
	}

	getLogLevelName(level: number): string {
		return LogLevel[level] || 'Unknown';
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

	async ngOnInit() {
		await this.loadOptions();
		this.loggerConfig = this.logger.getConfig();

		// If logging is enabled in storage but the user has since revoked the
		// data-collection permission, disable it silently on load.
		if (this.loggerConfig.enabled) {
			const permitted = await this.chromeService.hasLoggingPermission();
			if (!permitted) {
				this.logger.configure({ enabled: false });
				this.loggerConfig = this.logger.getConfig();
			}
		}
	}

	onDarkModeChange() {
		// Apply dark mode change immediately
		document.body.classList.toggle('dark-mode', this.options.display.darkMode);
	}

	async onLoggingToggle(event: Event) {
		const target = event.target as HTMLInputElement;
		const isEnabled = target.checked;

		if (isEnabled) {
			// On Firefox 139+, request the optional technicalAndInteraction
			// data-collection permission before enabling logging.
			const granted = await this.chromeService.requestLoggingPermission();
			if (!granted) {
				// User declined the permission prompt — revert the checkbox.
				target.checked = false;
				this.showStatus('Logging permission denied');
				return;
			}
		}

		this.logger.configure({ enabled: isEnabled });
		this.loggerConfig = this.logger.getConfig();

		const message = isEnabled ? 'Debug logging enabled' : 'Debug logging disabled';
		this.showStatus(message);
		this.logger.info('options.debugPanel.toggled', `Logging ${isEnabled ? 'enabled' : 'disabled'} by user`);
	}

	async resetToDefaults() {
		const confirmed = confirm(this.translate('Options_ResetConfirmation'));
		if (!confirmed) {
			return;
		}

		try {
			await this.chromeService.resetOptionsToDefaults();
			await this.loadOptions(); // Reload the fresh options
			this.showStatus(this.translate('Options_ResetSuccessful'));
			this.logger.info('options.reset', 'User reset options to defaults');
		} catch (error) {
			this.logger.error('options.resetFailed', 'Failed to reset options', error);
			this.showStatus(this.translate('Options_ResetFailed'));
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

	toggleDebugPanel() {
		this.showDebugPanel.set(!this.showDebugPanel());
		this.logger.debug('options.debugPanel.toggled', `Panel visibility: ${this.showDebugPanel()}`);
		if (this.showDebugPanel()) {
			this.loggerConfig = this.logger.getConfig();
		}
	}

	// Private methods (alphabetically)
	private showStatus(message: string) {
		this.statusMessage.set(message);
		setTimeout(() => {
			this.statusMessage.set('');
		}, 2000);
	}
}
