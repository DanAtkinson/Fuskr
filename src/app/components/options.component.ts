import { Component, OnInit } from '@angular/core';
import { ChromeService, ChromeStorageData } from '../services/chrome.service';

@Component({
    selector: 'app-options',
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.scss'],
    standalone: false
})
export class OptionsComponent implements OnInit {
	options: ChromeStorageData = {
		darkMode: false,
		keepRecentFusks: true,
		openInForeground: true,
		// Image resize options
		resizeImagesToFitOnPage: true,
		resizeImagesToFullWidth: false,
		resizeImagesToFillPage: false,
		resizeImagesToThumbnails: false,
		// Image viewer options
		showImagesInViewer: false,
		toggleBrokenImages: false,
		// Default display mode
		imageDisplayMode: 'fitOnPage'
	};

	statusMessage = '';

	constructor(private chromeService: ChromeService) {}

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
			this.showStatus('Options saved!');
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
