import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuskrService } from '@services/fuskr.service';
import { LoggerService } from '@services/logger.service';
import { MediaTypeService } from '@services/media-type.service';
import { BaseComponent } from './base.component';
import { MediaItem } from '../models/media-item.interface';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
	selector: 'app-gallery',
	standalone: false,
	styleUrls: ['./gallery.component.scss'],
	templateUrl: './gallery.component.html',
})
export class GalleryComponent extends BaseComponent implements OnInit {
	// Public properties (alphabetically)
	brokenImages: number = 0;
	currentViewerImage: string = '';
	currentViewerIndex: number = 0;
	darkMode: boolean = false;
	downloadProgress: number = 0;
	downloadStatus: string = '';
	enableOverloadProtection: boolean = true;
	errorMessage: string = '';
	imageDisplayMode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails' = 'fitOnPage';
	imageUrls: string[] = []; // Deprecated: Use mediaItems instead
	isDownloading: boolean = false;
	loadedImages: number = 0;
	loading: boolean = false;
	mediaItems: MediaItem[] = [];
	mediaTypeLoadingProgress: number = 0;
	originalUrl: string = '';
	overloadProtectionLimit: number = 50;
	showBrokenImages: boolean = false;
	showImageViewer: boolean = false;
	showUrlList: boolean = false;
	totalImages: number = 0;

	// Computed properties for template
	allUrlsText: string = '';
	currentMediaItem: MediaItem | null = null;

	// Private properties (alphabetically)
	private hasInitialized: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private fuskrService: FuskrService,
		private logger: LoggerService,
		private mediaTypeService: MediaTypeService
	) {
		super();
	}

	// Public methods (alphabetically)
	closeImageViewer() {
		this.showImageViewer = false;
	}

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

	copyUrl(url: string, event: Event) {
		event.stopPropagation();
		navigator.clipboard.writeText(url).then(() => {
			// Could show a toast notification here
			this.logger.info('gallery.urlCopied', 'URL copied to clipboard');
		});
	}

	async downloadAll() {
		// Use mediaItems if available, otherwise fall back to imageUrls for backward compatibility
		const totalItems = this.mediaItems.length > 0 ? this.mediaItems.length : this.imageUrls.length;
		if (totalItems === 0) return;

		// Prompt user for zip filename with timestamp default
		const defaultFilename = this.generateZipFilename();
		const zipFilename = prompt(
			this.translate('Gallery_DownloadPromptFilename'),
			defaultFilename
		);

		// User cancelled the prompt
		if (zipFilename === null) {
			this.logger.info('gallery.download.cancelled', 'User cancelled download');
			return;
		}

		// Ensure filename has .zip extension
		const finalFilename = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;

		this.isDownloading = true;
		this.downloadProgress = 0;
		this.downloadStatus = this.translate('Gallery_DownloadPreparing');

		try {
			const zip = new JSZip();
			const validMediaItems = this.getValidMediaItems();

			if (validMediaItems.length === 0) {
				this.downloadStatus = this.translate('Gallery_DownloadNoImages');
				this.isDownloading = false;
				return;
			}

			const imageCount = validMediaItems.filter(item => item.type === 'image').length;
			const videoCount = validMediaItems.filter(item => item.type === 'video').length;
			
			this.downloadStatus = this.translate('Gallery_DownloadingMedia', [
				validMediaItems.length.toString(),
				imageCount.toString(),
				videoCount.toString()
			]);

			// Download all media items and add to ZIP
			for (let i = 0; i < validMediaItems.length; i++) {
				const mediaItem = validMediaItems[i];
				const filename = this.getFilename(mediaItem.url);

				try {
					this.downloadStatus = this.translate('Gallery_DownloadingItem', [
						filename, 
						(i + 1).toString(), 
						validMediaItems.length.toString(),
						mediaItem.type
					]);
					this.downloadProgress = Math.round((i / validMediaItems.length) * 70); // Reserve 30% for ZIP generation and metadata

					const mediaBlob = await this.fetchMediaAsBlob(mediaItem.url);
					zip.file(filename, mediaBlob);

				} catch (error) {
					this.logger.warn('gallery.download.failed', `Failed to download ${filename}`, error);
					// Continue with other media items
				}
			}

			this.downloadStatus = this.translate('Gallery_DownloadAddingMetadata');
			this.downloadProgress = 75;

			// Add Fuskr.txt metadata file
			const metadataContent = this.generateMetadataContent(validMediaItems);
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
			saveAs(zipBlob, finalFilename);

			this.downloadStatus = this.translate('Gallery_DownloadComplete');
			this.downloadProgress = 100;

			this.logger.info('gallery.download.success', 'ZIP download completed successfully', {
				filename: finalFilename,
				totalItems: validMediaItems.length,
				imageCount,
				videoCount
			});

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

	downloadImage(url: string, event: Event) {
		event.stopPropagation();
		const filename = this.getFilename(url);
		this.chromeService.downloadFile(url, filename);
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

	getAllUrlsText(): string {
		// Use mediaItems if available, otherwise fall back to imageUrls for backward compatibility
		if (this.mediaItems.length > 0) {
			return this.mediaItems.map(item => item.url).join('\n');
		}
		return this.imageUrls.join('\n');
	}

	private updateAllUrlsText(): void {
		this.allUrlsText = this.getAllUrlsText();
	}

	getFilename(url: string): string {
		return this.fuskrService.getImageFilename(url);
	}

	getImageAltText(index: number): string {
		return `${this.translate('Gallery_ImageAlt')} ${index + 1}`;
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

	navigateToHistory() {
		this.router.navigate(['/history']);
	}

	nextImage() {
		const totalCount = this.mediaItems.length > 0 ? this.mediaItems.length : this.imageUrls.length;
		if (this.currentViewerIndex < totalCount - 1) {
			this.currentViewerIndex++;
			if (this.mediaItems.length > 0) {
				this.currentViewerImage = this.mediaItems[this.currentViewerIndex].url;
				this.currentMediaItem = this.mediaItems[this.currentViewerIndex];
			} else {
				this.currentViewerImage = this.imageUrls[this.currentViewerIndex];
				this.currentMediaItem = null;
			}
		}
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
		const element = event.target as HTMLImageElement | HTMLVideoElement;

		// Only count successful loads (not our error placeholders)
		if (!element.src.startsWith('data:') && !element.classList.contains('error')) {
			this.updateImageCounts();
		}
	}

	openImage(url: string) {
		if (this.chromeService.isExtensionContext()) {
			this.chromeService.openTab(url);
		} else {
			window.open(url, '_blank');
		}
	}

	openImageViewer(url: string, index: number) {
		this.currentViewerImage = url;
		this.currentViewerIndex = index;
		this.currentMediaItem = this.mediaItems[index] || null;
		this.showImageViewer = true;
	}

	previousImage() {
		if (this.currentViewerIndex > 0) {
			this.currentViewerIndex--;
			if (this.mediaItems.length > 0) {
				this.currentViewerImage = this.mediaItems[this.currentViewerIndex].url;
				this.currentMediaItem = this.mediaItems[this.currentViewerIndex];
			} else {
				this.currentViewerImage = this.imageUrls[this.currentViewerIndex];
				this.currentMediaItem = null;
			}
		}
	}

	removeBrokenImages() {
		// Create a list of URLs that correspond to broken images and videos
		const brokenImages = document.querySelectorAll('img.error');
		const brokenVideos = document.querySelectorAll('video.error');
		const brokenUrls = new Set<string>();

		// Handle broken images
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

		// Handle broken videos
		brokenVideos.forEach((video: Element) => {
			const htmlVideo = video as HTMLVideoElement;
			// Get the original URL from the data attribute
			const originalUrl = htmlVideo.getAttribute('data-original-url');
			if (originalUrl) {
				brokenUrls.add(originalUrl);
			}

			// Remove the container from DOM
			const container = htmlVideo.closest('.image-item');
			if (container) {
				container.remove();
			}
		});

		// Update both arrays to remove broken URLs
		this.imageUrls = this.imageUrls.filter((url: string) => !brokenUrls.has(url));
		this.mediaItems = this.mediaItems.filter(item => !brokenUrls.has(item.url));
		this.totalImages = this.mediaItems.length > 0 ? this.mediaItems.length : this.imageUrls.length;
		this.brokenImages = 0;
	}

	selectAllUrls() {
		const textarea = document.querySelector('.url-textarea') as HTMLTextAreaElement;
		if (textarea) {
			textarea.select();
			textarea.setSelectionRange(0, 99999); // For mobile devices
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

	async toggleDarkMode() {
		this.darkMode = !this.darkMode;
		document.body.classList.toggle('dark-mode', this.darkMode);

		// Save to storage
		try {
			await this.chromeService.updateDisplaySettings({ darkMode: this.darkMode });
		} catch (error) {
			this.logger.error('gallery.darkMode.saveFailed', 'Error saving dark mode setting', error);
		}
	}

	toggleUrlList() {
		this.showUrlList = !this.showUrlList;
	}

	// Private methods (alphabetically)
	private addToHistory() {
		// Add gallery to history after images have had time to load
		setTimeout(async () => {
			const entry = {
				originalUrl: this.originalUrl,
				totalImages: this.totalImages,
				loadedImages: this.loadedImages,
				brokenImages: this.brokenImages,
				imageUrls: this.mediaItems.length > 0 ? this.mediaItems.map(item => item.url) : this.imageUrls,
				displayMode: this.imageDisplayMode
			};

			try {
				await this.chromeService.addGalleryToHistory(entry);
				this.logger.info('GalleryComponent', 'Gallery added to history successfully', {
					url: this.originalUrl,
					totalImages: this.totalImages
				});
			} catch (error) {
				this.logger.error('GalleryComponent', 'Failed to add gallery to history', error);
			}
		}, 2500); // Wait a bit longer than the updateImageCounts timeout to get accurate counts
	}

	private applyDarkModeStyles() {
		document.body.classList.toggle('dark-mode', this.darkMode);
		this.logger.debug('GalleryComponent', 'Dark mode styles applied', { darkMode: this.darkMode });
	}

	private async fetchMediaAsBlob(url: string): Promise<Blob> {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch media: ${response.statusText}`);
		}
		return response.blob();
	}

	private focusUrlInput() {
		const urlInput = document.querySelector('input[type="url"]') as HTMLInputElement;
		if (urlInput) {
			urlInput.focus();
			urlInput.select(); // Select any existing text
		}
	}

	private generateMetadataContent(mediaItems: MediaItem[]): string {
		const lines: string[] = [
			'These media files were downloaded using Fuskr.',
			'',
			`Fusk Url: ${this.originalUrl || 'Unknown'}`,
			'',
			'Media Files:'
		];

		// Add each media item with type information
		mediaItems.forEach(item => {
			lines.push(`${item.type.toUpperCase()}: ${item.url}`);
		});

		// Add download timestamp and statistics
		lines.push('');
		lines.push(`Downloaded: ${new Date().toISOString()}`);
		lines.push(`Total Media Files: ${mediaItems.length}`);
		lines.push(`Images: ${mediaItems.filter((item: MediaItem) => item.type === 'image').length}`);
		lines.push(`Videos: ${mediaItems.filter((item: MediaItem) => item.type === 'video').length}`);
		lines.push(`Unknown: ${mediaItems.filter((item: MediaItem) => item.type === 'unknown').length}`);

		return lines.join('\n');
	}

	private generateZipFilename(): string {
		// Generate a filename based on the original URL or current date
		return `fuskr-gallery-${new Date().toISOString()}.zip`;
	}

	private getValidMediaItems(): MediaItem[] {
		// If we have mediaItems, filter them based on loaded state and DOM validation
		if (this.mediaItems.length > 0) {
			return this.mediaItems.filter(item => {
				// Only include items that are successfully loaded
				if (item.loadingState !== 'loaded') {
					return false;
				}

				// Additional DOM validation to ensure the media is actually displayed and loaded
				if (item.type === 'image') {
					const imgElement = document.querySelector(`img[src="${item.url}"]`) as HTMLImageElement;
					return imgElement && 
						   imgElement.complete && 
						   imgElement.naturalHeight !== 0 && 
						   !imgElement.classList.contains('error') &&
						   this.isValidMediaUrl(item.url);
				} else if (item.type === 'video') {
					const videoElement = document.querySelector(`video[src="${item.url}"]`) as HTMLVideoElement;
					return videoElement && 
						   videoElement.readyState >= 2 && 
						   !videoElement.classList.contains('error') &&
						   this.isValidMediaUrl(item.url);
				}

				// For unknown types, just check if the URL is valid
				return this.isValidMediaUrl(item.url);
			});
		}

		// Fallback to the old method for backward compatibility
		const validUrls = this.getValidImageUrls();
		return validUrls.map(url => ({
			url,
			type: 'unknown' as const,
			mimeType: 'application/octet-stream',
			loadingState: 'loaded' as const
		}));
	}

	private getValidImageUrls(): string[] {
		// Get all images and videos that are not broken and are actual media URLs (not data URLs or placeholders)
		const images = document.querySelectorAll('.fusk-image') as NodeListOf<HTMLImageElement>;
		const videos = document.querySelectorAll('.fusk-video') as NodeListOf<HTMLVideoElement>;
		const validUrls: string[] = [];

		// Process images
		images.forEach(img => {
			// Check if image has loaded successfully (not broken)
			if (img.complete && img.naturalHeight !== 0) {
				const url = img.src;
				// Filter out data URLs, placeholder images, and invalid URLs
				if (this.isValidMediaUrl(url)) {
					validUrls.push(url);
				}
			}
		});

		// Process videos
		videos.forEach(video => {
			// Check if video has loaded successfully (not broken)
			if (video.readyState >= 2) { // HAVE_CURRENT_DATA or better
				const url = video.src;
				// Filter out data URLs, placeholder videos, and invalid URLs
				if (this.isValidMediaUrl(url)) {
					validUrls.push(url);
				}
			}
		});

		return validUrls;
	}

	private isValidMediaUrl(url: string): boolean {
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

		// Check for common image and video extensions
		const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
		const videoExtensions = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.m4v'];
		const urlWithoutQuery = url.split('?')[0].toLowerCase();

		const hasImageExtension = imageExtensions.some(ext => urlWithoutQuery.endsWith(ext));
		const hasVideoExtension = videoExtensions.some(ext => urlWithoutQuery.endsWith(ext));

		return hasImageExtension || hasVideoExtension;
	}

	private async performGalleryGeneration() {
		this.loading = true;
		this.errorMessage = '';
		this.imageUrls = [];
		this.mediaItems = [];

		try {
			const result = this.fuskrService.generateImageGallery(this.originalUrl);
			this.imageUrls = result.urls; // Keep for backward compatibility
			this.totalImages = this.imageUrls.length;
			this.loadedImages = 0;
			this.brokenImages = 0;

			// Create MediaItems and determine their types
			if (this.imageUrls.length > 0) {
				this.logger.info('GalleryComponent', 'Starting media type detection', {
					totalUrls: this.imageUrls.length
				});

				// Process media items in batches to determine their actual types
				this.mediaTypeLoadingProgress = 0;
				this.mediaItems = await this.mediaTypeService.batchDetermineMediaTypes(
					this.imageUrls,
					5 // Process 5 at a time to be respectful to servers
				);

				this.mediaTypeLoadingProgress = 100;
				this.logger.info('GalleryComponent', 'Media type detection completed', {
					totalItems: this.mediaItems.length,
					imageCount: this.mediaItems.filter(item => item.type === 'image').length,
					videoCount: this.mediaItems.filter(item => item.type === 'video').length,
					unknownCount: this.mediaItems.filter(item => item.type === 'unknown').length
				});

				// Update computed properties
				this.updateAllUrlsText();
			}

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

			// Add the gallery to history if it was successfully generated
			if (this.imageUrls.length > 0) {
				this.addToHistory();
			}

			if (this.imageUrls.length === 0) {
				this.errorMessage = this.translate('Gallery_ErrorNoPattern');
			}
		} catch (error) {
			this.errorMessage = this.translate('Gallery_ErrorGenerating') + ' ' + (error as Error).message;
		} finally {
			this.loading = false;
		}
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

	private updateBrowserUrl(url: string) {
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { url: url },
			queryParamsHandling: 'merge'
		});
	}

	private updateImageCounts() {
		// Count both images and videos from DOM
		const allImages = document.querySelectorAll('.fusk-image') as NodeListOf<HTMLImageElement>;
		const allVideos = document.querySelectorAll('.fusk-video') as NodeListOf<HTMLVideoElement>;
		let loaded = 0;
		let broken = 0;

		// Count images
		allImages.forEach(img => {
			if (img.classList.contains('error')) {
				broken++;
			} else if (img.complete && img.naturalHeight !== 0 && !img.src.startsWith('data:')) {
				loaded++;
			}
		});

		// Count videos
		allVideos.forEach(video => {
			if (video.classList.contains('error')) {
				broken++;
			} else if (video.readyState >= 2 && !video.src.startsWith('data:')) { // HAVE_CURRENT_DATA or better
				loaded++;
			}
		});

		this.loadedImages = loaded;
		this.brokenImages = broken;
	}

}
