import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuskrService } from '@services/fuskr.service';
import { LoggerService } from '@services/logger.service';
import { BaseComponent } from './base.component';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    standalone: false
})
export class GalleryComponent extends BaseComponent implements OnInit {
	originalUrl: string = '';
	imageUrls: string[] = [];
	loading: boolean = false;
	errorMessage: string = '';

	// Image tracking
	loadedImages: number = 0;
	brokenImages: number = 0;
	totalImages: number = 0;

	// Download tracking
	isDownloading: boolean = false;
	downloadProgress: number = 0;
	downloadStatus: string = '';

	// UI state
	showBrokenImages: boolean = false;
	showImageViewer: boolean = false;
	showUrlList: boolean = false;
	currentViewerImage: string = '';
	currentViewerIndex: number = 0;

	// Settings
	darkMode: boolean = false;
	imageDisplayMode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails' = 'fitOnPage';
	enableOverloadProtection: boolean = true;
	overloadProtectionLimit: number = 50;

	// Prevent duplicate initialization
	private hasInitialized: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private fuskrService: FuskrService,
		private logger: LoggerService
	) {
		super();
	}

	async ngOnInit() {
		await this.loadSettings();

		this.logger.debug('GalleryComponent', 'ngOnInit started', { hasInitialized: this.hasInitialized });

		// Ensure dark mode is applied immediately before any dialogs
		this.applyDarkModeStyles();

		// Handle both initial load and refresh scenarios
		this.route.queryParams.subscribe(params => {
			this.logger.debug('GalleryComponent', 'queryParams subscription triggered', { 
				params, 
				hasInitialized: this.hasInitialized 
			});
			if (params['url'] && !this.hasInitialized) {
				this.originalUrl = params['url'];
				this.hasInitialized = true;
				this.logger.info('GalleryComponent', 'Starting gallery generation from queryParams', { url: this.originalUrl });
				// Small delay to ensure dark mode styles are fully applied
				setTimeout(() => {
					this.generateGallery();
				}, 10);
			} else if (!params['url'] && !this.hasInitialized) {
				// If no URL provided (manual mode), focus on the input after a short delay
				this.hasInitialized = true;
				this.logger.debug('GalleryComponent', 'Entering manual mode (no URL in queryParams)');
				setTimeout(() => {
					this.focusUrlInput();
				}, 100);
			}
		});

		// Also check on immediate initialization in case queryParams subscription is delayed
		const currentParams = this.route.snapshot.queryParams;
		this.logger.debug('GalleryComponent', 'Checking snapshot params', { 
			currentParams, 
			hasInitialized: this.hasInitialized,
			originalUrl: this.originalUrl
		});
		if (currentParams['url'] && !this.originalUrl && !this.hasInitialized) {
			this.originalUrl = currentParams['url'];
			this.hasInitialized = true;
			this.logger.info('GalleryComponent', 'Starting gallery generation from snapshot', { url: this.originalUrl });
			// Small delay to ensure dark mode styles are fully applied
			setTimeout(() => {
				this.generateGallery();
			}, 10);
		} else if (!currentParams['url'] && !this.originalUrl && !this.hasInitialized) {
			// Manual mode - focus on input
			this.hasInitialized = true;
			this.logger.debug('GalleryComponent', 'Entering manual mode (no URL in snapshot)');
			setTimeout(() => {
				this.focusUrlInput();
			}, 100);
		}
	}

	async loadSettings() {
		try {
			const settings = await this.chromeService.getStorageData();
			this.logger.debug('GalleryComponent', 'Settings loaded successfully', settings);
			this.darkMode = settings.display.darkMode;
			this.imageDisplayMode = settings.display.imageDisplayMode;
			this.showBrokenImages = settings.display.toggleBrokenImages;
			this.enableOverloadProtection = settings.safety.enableOverloadProtection;
			this.overloadProtectionLimit = settings.safety.overloadProtectionLimit;
			this.logger.info('GalleryComponent', 'Overload protection configured', {
				enabled: this.enableOverloadProtection,
				limit: this.overloadProtectionLimit
			});

			// Dark mode will be applied by applyDarkModeStyles() after settings are loaded
		} catch (error) {
			this.logger.error('GalleryComponent', 'Error loading settings', error);
		}
	}

	/**
	 * Apply dark mode styles to the document body
	 * This is called after settings are loaded to ensure styles are applied before any dialogs
	 */
	private applyDarkModeStyles() {
		document.body.classList.toggle('dark-mode', this.darkMode);
		this.logger.debug('GalleryComponent', 'Dark mode styles applied', { darkMode: this.darkMode });
	}

	generateGallery() {
		this.logger.info('GalleryComponent', 'generateGallery() called', { url: this.originalUrl });
		if (!this.originalUrl.trim()) {
			this.errorMessage = this.translate('Gallery_ErrorValidUrl');
			this.logger.warn('GalleryComponent', 'Gallery generation failed: empty URL');
			return;
		}

		// Check for overload protection before generating
		if (this.enableOverloadProtection) {
			const urlCount = this.fuskrService.countPotentialUrls(this.originalUrl);
			this.logger.info('GalleryComponent', 'Overload protection check', {
				urlCount,
				limit: this.overloadProtectionLimit,
				willTrigger: urlCount > this.overloadProtectionLimit
			});
			if (urlCount > this.overloadProtectionLimit) {
				this.showOverloadWarning(urlCount);
				return;
			}
		} else {
			this.logger.debug('GalleryComponent', 'Overload protection is disabled');
		}

		this.performGalleryGeneration();
	}

	private showOverloadWarning(urlCount: number) {
		const message = this.translate('Gallery_OverloadWarning', [
			urlCount.toString(),
			this.overloadProtectionLimit.toString()
		]);
		this.logger.warn('GalleryComponent', 'Showing overload warning dialog', { 
			urlCount, 
			limit: this.overloadProtectionLimit,
			message
		});
		const proceed = confirm(message);
		this.logger.info('GalleryComponent', 'User response to overload warning', { 
			proceed,
			action: proceed ? 'continue' : 'cancel'
		});

		if (proceed) {
			this.logger.info('GalleryComponent', 'User chose to proceed with gallery generation despite warning');
			this.performGalleryGeneration();
		} else {
			this.logger.info('GalleryComponent', 'User chose to cancel gallery generation');
		}
	}

	private performGalleryGeneration() {
		this.loading = true;
		this.errorMessage = '';
		this.imageUrls = [];

		try {
			const result = this.fuskrService.generateImageGallery(this.originalUrl);
			this.imageUrls = result.urls;
			this.totalImages = this.imageUrls.length;
			this.loadedImages = 0;
			this.brokenImages = 0;

			// Do a final count after images have had time to load
			setTimeout(() => {
				this.updateImageCounts();
			}, 2000);

			// Update the URL in the browser to show the bracketed version
			if (result.originalUrl !== this.originalUrl) {
				this.originalUrl = result.originalUrl;
			}

			// Update the browser URL to reflect the generated gallery
			this.updateBrowserUrl(this.originalUrl);

			if (this.imageUrls.length === 0) {
				this.errorMessage = this.translate('Gallery_ErrorNoPattern');
			}
		} catch (error) {
			this.errorMessage = this.translate('Gallery_ErrorGenerating') + ' ' + (error as Error).message;
		} finally {
			this.loading = false;
		}
	}	openImage(url: string) {
		if (this.chromeService.isExtensionContext()) {
			this.chromeService.openTab(url);
		} else {
			window.open(url, '_blank');
		}
	}

	downloadImage(url: string, event: Event) {
		event.stopPropagation();
		const filename = this.getFilename(url);
		this.chromeService.downloadFile(url, filename);
	}

	async downloadAll() {
		if (this.imageUrls.length === 0) return;

		this.isDownloading = true;
		this.downloadProgress = 0;
		this.downloadStatus = this.translate('Gallery_DownloadPreparing');

		try {
			const zip = new JSZip();
			const validImages = this.getValidImageUrls();

			if (validImages.length === 0) {
				this.downloadStatus = this.translate('Gallery_DownloadNoImages');
				this.isDownloading = false;
				return;
			}

			this.downloadStatus = this.translate('Gallery_DownloadingImages', [validImages.length.toString()]);

			// Download all images and add to ZIP
			for (let i = 0; i < validImages.length; i++) {
				const url = validImages[i];
				const filename = this.getFilename(url);

				try {
					this.downloadStatus = this.translate('Gallery_DownloadingImage', [filename, (i + 1).toString(), validImages.length.toString()]);
					this.downloadProgress = Math.round((i / validImages.length) * 70); // Reserve 30% for ZIP generation and metadata

					const imageBlob = await this.fetchImageAsBlob(url);
					zip.file(filename, imageBlob);

				} catch (error) {
					this.logger.warn('gallery.download.failed', `Failed to download ${filename}`, error);
					// Continue with other images
				}
			}

			this.downloadStatus = this.translate('Gallery_DownloadAddingMetadata');
			this.downloadProgress = 75;

			// Add Fuskr.txt metadata file
			const metadataContent = this.generateMetadataContent(validImages);
			zip.file('Fuskr.txt', metadataContent);

			this.downloadStatus = this.translate('Gallery_DownloadCreatingZip');
			this.downloadProgress = 85;

			// Generate ZIP file
			const zipBlob = await zip.generateAsync({
				type: 'blob',
				compression: 'DEFLATE',
				compressionOptions: { level: 6 }
			});

			this.downloadStatus = this.translate('Gallery_DownloadSaving');
			this.downloadProgress = 95;

			// Save the ZIP file
			const zipFilename = this.generateZipFilename();
			saveAs(zipBlob, zipFilename);

			this.downloadStatus = this.translate('Gallery_DownloadComplete');
			this.downloadProgress = 100;

			// Reset status after 3 seconds
			setTimeout(() => {
				this.isDownloading = false;
				this.downloadStatus = '';
				this.downloadProgress = 0;
			}, 3000);

		} catch (error) {
			this.logger.error('gallery.download.zipFailed', 'Error creating ZIP download', error);
			this.downloadStatus = this.translate('Gallery_DownloadFailed');
			setTimeout(() => {
				this.isDownloading = false;
				this.downloadStatus = '';
				this.downloadProgress = 0;
			}, 3000);
		}
	}

	private async fetchImageAsBlob(url: string): Promise<Blob> {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.statusText}`);
		}
		return response.blob();
	}

	private getValidImageUrls(): string[] {
		// Get all images that are not broken and are actual image URLs (not data URLs or placeholders)
		const images = document.querySelectorAll('.fusk-image') as NodeListOf<HTMLImageElement>;
		const validUrls: string[] = [];

		images.forEach(img => {
			// Check if image has loaded successfully (not broken)
			if (img.complete && img.naturalHeight !== 0) {
				const url = img.src;
				// Filter out data URLs, placeholder images, and invalid URLs
				if (this.isValidImageUrl(url)) {
					validUrls.push(url);
				}
			}
		});

		return validUrls;
	}

	private isValidImageUrl(url: string): boolean {
		// Reject data URLs (like the SVG placeholder)
		if (url.startsWith('data:')) {
			return false;
		}

		// Reject blob URLs (temporary URLs)
		if (url.startsWith('blob:')) {
			return false;
		}

		// Must be HTTP/HTTPS
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			return false;
		}

		// Check for common image extensions
		const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
		const urlWithoutQuery = url.split('?')[0].toLowerCase();
		const hasImageExtension = imageExtensions.some(ext => urlWithoutQuery.endsWith(ext));

		return hasImageExtension;
	}

	private generateZipFilename(): string {
		// Generate a filename based on the original URL or current date
		return `fuskr-gallery-${new Date().toISOString()}.zip`;
	}

	copyUrl(url: string, event: Event) {
		event.stopPropagation();
		navigator.clipboard.writeText(url).then(() => {
			// Could show a toast notification here
			this.logger.info('gallery.urlCopied', 'URL copied to clipboard');
		});
	}

	getFilename(url: string): string {
		return this.fuskrService.getImageFilename(url);
	}

	onImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		const originalUrl = img.getAttribute('data-original-url') || img.src;

		// Only process if this image hasn't been marked as error yet
		if (!img.classList.contains('error')) {
			img.classList.add('error');
			this.updateImageCounts();

			// Create a theme-aware broken image placeholder
			const isDark = document.body.classList.contains('dark-mode');
			const bgColor = isDark ? '#212529' : '#f8f9fa';
			const borderColor = isDark ? '#495057' : '#dee2e6';
			const textColor = isDark ? '#adb5bd' : '#6c757d';
			const subtextColor = isDark ? '#6c757d' : '#adb5bd';

			const brokenImageSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
				<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
					<rect width="100%" height="100%" fill="${bgColor}" stroke="${borderColor}" stroke-width="2"/>
					<text x="50%" y="45%" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${this.translate('Gallery_ImageNotFound')}</text>
					<text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" fill="${subtextColor}" text-anchor="middle" dominant-baseline="middle">🚫</text>
				</svg>
			`)}`;

			if (!this.showBrokenImages) {
				// Instead of hiding completely, reduce opacity
				img.style.opacity = '0.3';
				img.style.filter = 'grayscale(100%)';
			}

			// Always show the broken image placeholder
			img.src = brokenImageSvg;
			img.alt = this.translate('Gallery_ImageNotFound');
		}
	}

	onImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;

		// Only count successful loads (not our error placeholders)
		if (!img.src.startsWith('data:') && !img.classList.contains('error')) {
			this.updateImageCounts();
		}
	}

	private updateImageCounts() {
		// Count images directly from DOM
		const allImages = document.querySelectorAll('.fusk-image') as NodeListOf<HTMLImageElement>;
		let loaded = 0;
		let broken = 0;

		allImages.forEach(img => {
			if (img.classList.contains('error')) {
				broken++;
			} else if (img.complete && img.naturalHeight !== 0 && !img.src.startsWith('data:')) {
				loaded++;
			}
		});

		this.loadedImages = loaded;
		this.brokenImages = broken;
	}	async toggleDarkMode() {
		this.darkMode = !this.darkMode;
		document.body.classList.toggle('dark-mode', this.darkMode);

		// Save to storage
		try {
			await this.chromeService.updateDisplaySettings({ darkMode: this.darkMode });
		} catch (error) {
			this.logger.error('gallery.darkMode.saveFailed', 'Error saving dark mode setting', error);
		}
	}

	async setImageDisplayMode(mode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails') {
		this.imageDisplayMode = mode;

		// Save to storage
		try {
			await this.chromeService.updateDisplaySettings({ imageDisplayMode: mode });
		} catch (error) {
			this.logger.error('gallery.displayMode.saveFailed', 'Error saving display mode setting', error);
		}
	}

	async toggleBrokenImagesVisibility() {
		this.showBrokenImages = !this.showBrokenImages;

		// Update visibility of broken images
		const brokenImages = document.querySelectorAll('img.error');
		brokenImages.forEach((img: Element) => {
			const htmlImg = img as HTMLImageElement;
			if (this.showBrokenImages) {
				htmlImg.style.opacity = '1';
				htmlImg.style.filter = 'none';
			} else {
				htmlImg.style.opacity = '0.3';
				htmlImg.style.filter = 'grayscale(100%)';
			}
		});

		// Save to storage
		try {
			await this.chromeService.updateDisplaySettings({ toggleBrokenImages: this.showBrokenImages });
		} catch (error) {
			this.logger.error('gallery.brokenImages.saveFailed', 'Error saving broken images setting', error);
		}
	}

	openImageViewer(url: string, index: number) {
		this.currentViewerImage = url;
		this.currentViewerIndex = index;
		this.showImageViewer = true;
	}

	closeImageViewer() {
		this.showImageViewer = false;
	}

	nextImage() {
		if (this.currentViewerIndex < this.imageUrls.length - 1) {
			this.currentViewerIndex++;
			this.currentViewerImage = this.imageUrls[this.currentViewerIndex];
		}
	}

	previousImage() {
		if (this.currentViewerIndex > 0) {
			this.currentViewerIndex--;
			this.currentViewerImage = this.imageUrls[this.currentViewerIndex];
		}
	}

	removeBrokenImages() {
		// Create a list of URLs that correspond to broken images
		const brokenImages = document.querySelectorAll('img.error');
		const brokenUrls = new Set<string>();

		brokenImages.forEach((img: Element) => {
			const htmlImg = img as HTMLImageElement;
			// Get the original URL from the data attribute
			const originalUrl = htmlImg.getAttribute('data-original-url');
			if (originalUrl) {
				brokenUrls.add(originalUrl);
			}

			// Remove the container from DOM
			const container = htmlImg.closest('.image-item');
			if (container) {
				container.remove();
			}
		});

		// Update the URLs array to remove broken URLs
		this.imageUrls = this.imageUrls.filter(url => !brokenUrls.has(url));
		this.totalImages = this.imageUrls.length;
		this.brokenImages = 0;
	}

	/**
	 * Generate localized alt text for images
	 */
	getImageAltText(index: number): string {
		return `${this.translate('Gallery_ImageAlt')} ${index + 1}`;
	}

	private generateMetadataContent(imageUrls: string[]): string {
		const lines: string[] = [
			'These images were downloaded using Fuskr.',
			'',
			`Fusk Url: ${this.originalUrl || 'Unknown'}`,
			'',
			'Urls:'
		];

		// Add each image URL on a separate line
		imageUrls.forEach(url => {
			lines.push(url);
		});

		// Add download timestamp
		lines.push('');
		lines.push(`Downloaded: ${new Date().toISOString()}`);
		lines.push(`Total Images: ${imageUrls.length}`);

		return lines.join('\n');
	}

	/**
	 * Toggle the visibility of the URL list section
	 */
	toggleUrlList() {
		this.showUrlList = !this.showUrlList;
	}

	/**
	 * Get all image URLs as formatted text
	 */
	getAllUrlsText(): string {
		return this.imageUrls.join('\n');
	}

	/**
	 * Copy all URLs to clipboard
	 */
	async copyAllUrls() {
		try {
			const urlText = this.getAllUrlsText();
			await navigator.clipboard.writeText(urlText);
			this.logger.info('gallery.allUrlsCopied', 'All URLs copied to clipboard');
			// Could show a toast notification here
		} catch (error) {
			this.logger.error('gallery.copyUrls.failed', 'Failed to copy URLs', error);
		}
	}

	/**
	 * Select all text in the URL textarea
	 */
	selectAllUrls() {
		const textarea = document.querySelector('.url-textarea') as HTMLTextAreaElement;
		if (textarea) {
			textarea.select();
			textarea.setSelectionRange(0, 99999); // For mobile devices
		}
	}

	/**
	 * Focus on the URL input field (used for manual mode)
	 */
	private focusUrlInput() {
		const urlInput = document.querySelector('input[type="url"]') as HTMLInputElement;
		if (urlInput) {
			urlInput.focus();
			urlInput.select(); // Select any existing text
		}
	}

	/**
	 * Update the browser URL to reflect the current gallery URL
	 * This ensures that refreshing the page will return to the same gallery
	 */
	private updateBrowserUrl(url: string) {
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { url: url },
			queryParamsHandling: 'merge'
		});
	}
}
