import { Component, OnInit } from '@angular/core';
import { ChromeService, ChromeStorageData } from '../services/chrome.service';
import { BaseComponent } from './base.component';

@Component({
	selector: 'app-options',
	standalone: false,
	styleUrls: ['./options.component.scss'],
	templateUrl: './options.component.html',
})
export class OptionsComponent extends BaseComponent implements OnInit {
	options: ChromeStorageData = {
		darkMode: false,
		imageDisplayMode: 'fitOnPage',
		keepRecentFusks: true,
		openInForeground: true,
		resizeImagesToFillPage: false,
		resizeImagesToFitOnPage: true,
		resizeImagesToFullWidth: false,
		resizeImagesToThumbnails: false,
		showImagesInViewer: false,
		toggleBrokenImages: false,
	};

	statusMessage = '';

	constructor() {
		super();
	}

	async ngOnInit() {
		await this.loadOptions();
	}

	async loadOptions() {
		try {
			this.options = await this.chromeService.getStorageData();
		} catch (error) {
			console.error('Error loading options:', error);
		}
	}

	async saveOptions() {
		try {
			await this.chromeService.setStorageData(this.options);
			this.showStatus(this.translate('Options_SettingsSaved'));
		} catch (error) {
			console.error('Error saving options:', error);
			this.showStatus('Error saving options');
		}
	}

	private showStatus(message: string) {
		this.statusMessage = message;
		setTimeout(() => {
			this.statusMessage = '';
		}, 2000);
	}
}
