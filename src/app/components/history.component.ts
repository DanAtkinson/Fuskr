import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChromeService } from '@services/chrome.service';
import { LoggerService } from '@services/logger.service';
import { BaseComponent } from '@components/base.component';
import { GalleryHistoryEntry, GalleryHistory } from '@interfaces/gallery-history';

@Component({
	selector: 'app-history',
	standalone: true,
	imports: [CommonModule],
	styleUrls: ['./history.component.scss'],
	templateUrl: './history.component.html',
})
export class HistoryComponent extends BaseComponent implements OnInit {
	// Public properties (alphabetically)
	darkMode = false;
	history: GalleryHistory = { entries: [], maxEntries: 10 };
	loading = true;

	// Injected services
	public router = inject(Router);
	protected override chromeService = inject(ChromeService);
	private logger = inject(LoggerService);

	constructor() {
		super();
	}

	// Public methods (alphabetically)
	async clearAllHistory() {
		if (confirm(this.translate('History_ConfirmClearAll'))) {
			try {
				await this.chromeService.clearGalleryHistory();
				this.history.entries = [];
				this.logger.debug('history.cleared', 'All history cleared');
			} catch (error) {
				this.logger.error('history.clearFailed', 'Failed to clear history', error);
			}
		}
	}

	formatDate(date: Date | string): string {
		try {
			let dateObj: Date;

			if (date instanceof Date) {
				dateObj = date;
			} else {
				// Convert string/number to Date
				dateObj = new Date(date);
			}

			// Check if the date is valid
			if (isNaN(dateObj.getTime())) {
				this.logger.warn('history.formatDate', 'Invalid date provided', {
					date,
					dateType: typeof date,
					isDate: date instanceof Date,
				});
				return 'Invalid Date';
			}

			return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
		} catch (error) {
			this.logger.error('history.formatDate', 'Error formatting date', { date, error });
			return 'Invalid Date';
		}
	}

	getFilename(url: string): string {
		try {
			const urlObj = new URL(url);
			const pathname = urlObj.pathname;
			return pathname.substring(pathname.lastIndexOf('/') + 1) || 'gallery';
		} catch {
			return 'gallery';
		}
	}

	getSuccessRate(entry: GalleryHistoryEntry): number {
		if (entry.totalImages === 0) return 0;
		return Math.round((entry.loadedImages / entry.totalImages) * 100);
	}

	getSuccessRateClass(successRate: number): string {
		if (successRate >= 80) return 'success';
		if (successRate >= 50) return 'warning';
		return 'danger';
	}

	async ngOnInit() {
		await this.loadHistory();
		await this.loadSettings();
	}

	openGallery(entry: GalleryHistoryEntry) {
		// Use base64 encoding for cleaner URL handling without special character issues
		const encodedUrl = btoa(entry.originalUrl);
		this.router.navigate(['/gallery'], { queryParams: { url: encodedUrl } });
	}

	navigateToOptions() {
		this.router.navigate(['/options']);
	}

	async openGalleryInNewTab(entry: GalleryHistoryEntry) {
		try {
			const baseUrl = window.location.origin + window.location.pathname;
			// Use base64 encoding for cleaner URL handling without special character issues
			const encodedUrl = btoa(entry.originalUrl);
			const galleryUrl = `${baseUrl}#/gallery?url=${encodedUrl}`;

			if (this.chromeService.isExtensionContext()) {
				await this.chromeService.openTab(galleryUrl, true);
			} else {
				window.open(galleryUrl, '_blank');
			}

			this.logger.debug('history.galleryOpened', `Opened gallery in new tab: ${entry.originalUrl}`);
		} catch (error) {
			this.logger.error('history.openTabFailed', 'Failed to open gallery in new tab', error);
		}
	}

	async removeEntry(entry: GalleryHistoryEntry, event: Event) {
		event.stopPropagation(); // Prevent opening the gallery

		try {
			await this.chromeService.removeGalleryFromHistory(entry.id);
			// Remove from local array
			this.history.entries = this.history.entries.filter((e) => e.id !== entry.id);
			this.logger.debug('history.entryRemoved', `Removed history entry: ${entry.id}`);
		} catch (error) {
			this.logger.error('history.removeFailed', 'Failed to remove history entry', error);
		}
	}

	async toggleDarkMode() {
		this.darkMode = !this.darkMode;
		await this.chromeService.updateDisplaySettings({ darkMode: this.darkMode });
		this.applyTheme();
	}

	// Private methods (alphabetically)
	private applyTheme() {
		if (this.darkMode) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
	}

	private async loadHistory() {
		try {
			this.history = await this.chromeService.getGalleryHistory();

			// Debug timestamp data
			if (this.history.entries.length > 0) {
				const firstEntry = this.history.entries[0];
				this.logger.debug('history.loaded', `Loaded ${this.history.entries.length} history entries`, {
					firstEntryTimestamp: firstEntry.timestamp,
					timestampType: typeof firstEntry.timestamp,
					isDate: firstEntry.timestamp instanceof Date,
				});
			} else {
				this.logger.debug('history.loaded', 'No history entries found');
			}
		} catch (error) {
			this.logger.error('history.loadFailed', 'Failed to load gallery history', error);
		} finally {
			this.loading = false;
		}
	}

	private async loadSettings() {
		try {
			this.darkMode = await this.chromeService.getDarkMode();
			this.applyTheme();
		} catch (error) {
			this.logger.error('history.settingsLoadFailed', 'Failed to load settings', error);
		}
	}
}
