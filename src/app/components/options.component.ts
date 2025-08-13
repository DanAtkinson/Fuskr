import { Component, OnInit } from '@angular/core';
import { IChromeStorageData } from '@interfaces/chrome-storage';
import { ChromeStorageData } from '@models/chrome-storage';
import { LoggerService, LogLevel } from '@services/logger.service';
import { BaseComponent } from './base.component';

@Component({
  selector: 'app-options',
  standalone: false,
  styleUrls: ['./options.component.scss'],
  templateUrl: './options.component.html',
})
export class OptionsComponent extends BaseComponent implements OnInit {
  // Public properties (alphabetically)
  loggerConfig: any = {};
  options: ChromeStorageData = new ChromeStorageData();
  showDebugPanel: boolean = false;
  statusMessage: string = '';

  constructor(private logger: LoggerService) {
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
  }

  onDarkModeChange() {
    // Apply dark mode change immediately
    document.body.classList.toggle('dark-mode', this.options.display.darkMode);
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
    this.showDebugPanel = !this.showDebugPanel;
    this.logger.debug('options.debugPanel.toggled', `Panel visibility: ${this.showDebugPanel}`);
    if (this.showDebugPanel) {
      this.loggerConfig = this.logger.getConfig();
    }
  }

  // Private methods (alphabetically)
  private showStatus(message: string) {
    this.statusMessage = message;
    setTimeout(() => {
      this.statusMessage = '';
    }, 2000);
  }
}
