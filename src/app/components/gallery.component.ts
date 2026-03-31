import { Component, OnDestroy, OnInit, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuskrService } from '@services/fuskr.service';
import { LoggerService } from '@services/logger.service';
import { MediaTypeService } from '@services/media-type.service';
import { BaseComponent } from './base.component';
import { MediaItem } from '@interfaces/media';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
	selector: 'app-gallery',
	standalone: true,
	styleUrls: ['./gallery.component.scss'],
	templateUrl: './gallery.component.html',
	imports: [CommonModule, FormsModule],
})
export class GalleryComponent extends BaseComponent implements OnInit, OnDestroy {
	private static readonly infiniteBatchSize = 50;
	private static readonly infiniteContinuationPromptThresholds = [10, 50, 100] as const;
	private static readonly infiniteMaxItems = 2000;
	private static readonly viewerInfinitePreloadDistance = 2;

	// Public signals (alphabetically)
	autoRemoveBrokenImages = signal(false);
	brokenImages = signal(0);
	currentGalleryIndex = signal(-1); // For keyboard navigation in main gallery
	currentMediaItem = signal<MediaItem | null>(null);
	currentViewerImage = signal('');
	currentViewerIndex = signal(0);
	customCountDirection = signal<-1 | 0 | 1>(0);
	customCountRequested = signal(false);
	customCountValue = signal('10');
	darkMode = signal(false);
	downloadProgress = signal(0);
	downloadStatus = signal('');
	enableOverloadProtection = signal(true);
	errorMessage = signal('');
	fullScreenGallery = signal(false);
	imageDisplayMode = signal<'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails'>('fitOnPage');
	isDownloading = signal(false);
	isGenerating = signal(false);
	isInfiniteMode = signal(false);
	loadedImages = signal(0);
	loading = signal(false);
	mediaItems = signal<MediaItem[]>([]);
	mediaTypeLoadingProgress = signal(0);
	originalUrl = signal('');
	overloadProtectionLimit = signal(50);
	showBrokenImages = signal(false);
	showImageViewer = signal(false);
	showUrlList = signal(false);
	stickyControlsCollapsed = signal(false);
	stickyControlsCompressed = signal(false);
	stickyControlsEnabled = signal(true);
	toastMessage = signal('');
	toastVisible = signal(false);
	totalImages = signal(0);

	// Computed signals
	visibleMediaItems = computed(() => {
		const allMediaItems = this.mediaItems().filter((item): item is MediaItem => Boolean(item));
		if (this.showBrokenImages()) {
			return allMediaItems;
		}
		return allMediaItems.filter((item) => !this.brokenUrls().has(item.url));
	});
	allUrlsText = computed(() =>
		this.mediaItems()
			.filter((item): item is MediaItem => Boolean(item))
			.map((item) => item.url)
			.join('\n')
	);

	// Private signals
	private autoRemoveBrokenImagesSession = false; // Session-only: enabled after manual removal
	private backwardSentinelObserver: IntersectionObserver | null = null;
	private brokenUrls = signal(new Set<string>());
	private forwardSentinelObserver: IntersectionObserver | null = null;
	private hasInitialized = false;
	private infinitePatternBaseUrl = '';
	private infinitePatternPadLength = 0;
	private infinitePatternStep = 1;
	private isInfiniteContinuationPromptOpen = false;
	private isLoadingBackward = false;
	private isLoadingForward = false;
	private knownMediaUrls = new Set<string>();
	private lastPromptedBrokenThresholdBackward = 0;
	private lastPromptedBrokenThresholdForward = 0;
	private observerSetupTimeout: ReturnType<typeof setTimeout> | null = null;
	private scrollLoadCheckTimeout: ReturnType<typeof setTimeout> | null = null;
	private toastTimeout: ReturnType<typeof setTimeout> | null = null;
	private viewerTriggerElement: HTMLElement | null = null; // Element that opened the image viewer

	// Injected services
	private fuskrService = inject(FuskrService);
	private logger = inject(LoggerService);
	private mediaTypeService = inject(MediaTypeService);
	private route = inject(ActivatedRoute);
	private router = inject(Router);

	constructor() {
		super();
	}

	// Public methods (alphabetically)
	closeImageViewer() {
		this.showImageViewer.set(false);
		// Return focus to the element that triggered the viewer
		setTimeout(() => this.viewerTriggerElement?.focus(), 0);
	}

	async copyAllUrls() {
		try {
			const urlText = this.allUrlsText();
			await navigator.clipboard.writeText(urlText);
			this.logger.info('gallery.allUrlsCopied', 'All URLs copied to clipboard');
			this.showToast(this.translate('Gallery_CopiedAllUrls', [this.visibleMediaItems().length.toString()]));
		} catch (error) {
			this.logger.error('gallery.copyUrls.failed', 'Failed to copy URLs', error);
			this.showToast(this.translate('Gallery_CopyFailed'), true);
		}
	}

	copyUrl(url: string, event: Event) {
		event.stopPropagation();
		navigator.clipboard.writeText(url).then(() => {
			this.logger.info('gallery.urlCopied', 'URL copied to clipboard');
			this.showToast(this.translate('Gallery_CopiedUrl'));
		});
	}

	async downloadAll() {
		const totalItems = this.mediaItems().length;
		if (totalItems === 0) return;

		// Prompt user for zip filename with timestamp default
		const defaultFilename = this.generateZipFilename();
		const zipFilename = prompt(this.translate('Gallery_DownloadPromptFilename'), defaultFilename);

		// User cancelled the prompt
		if (zipFilename === null) {
			this.logger.info('gallery.download.cancelled', 'User cancelled download');
			return;
		}

		// Ensure filename has .zip extension
		const finalFilename = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;

		this.isDownloading.set(true);
		this.downloadProgress.set(0);
		this.downloadStatus.set(this.translate('Gallery_DownloadPreparing'));

		try {
			const zip = new JSZip();
			const validMediaItems = this.getValidMediaItems();

			if (validMediaItems.length === 0) {
				this.downloadStatus.set(this.translate('Gallery_DownloadNoImages'));
				this.isDownloading.set(false);
				return;
			}

			// Decide compression strategy: for large galleries, STORE media files to improve performance
			const compressionMode = this.getZipCompressionMode(validMediaItems.length); // 'STORE' | 'DEFLATE'

			const imageCount = validMediaItems.filter((item) => item.type === 'image').length;
			const videoCount = validMediaItems.filter((item) => item.type === 'video').length;

			this.downloadStatus.set(this.translate('Gallery_DownloadingMedia', [validMediaItems.length.toString(), imageCount.toString(), videoCount.toString()]));

			// Track used names to avoid overwriting within the zip
			const usedNames = new Map<string, number>();
			const manifestEntries: { originalUrl: string; zipPath: string; filename: string; type: string }[] = [];

			// Pre-compute duplicate counts by base filename to decide padding width per group
			const baseCounts = new Map<string, number>();
			for (const item of validMediaItems) {
				const base = this.getFilename(item.url);
				baseCounts.set(base, (baseCounts.get(base) || 0) + 1);
			}
			const basePadWidth = new Map<string, number>();
			baseCounts.forEach((count, base) => {
				basePadWidth.set(base, Math.max(0, String(count).length));
			});
			// Track current occurrence index per base (0-based)
			const baseOccurrence = new Map<string, number>();

			// Download all media items and add to ZIP
			for (let i = 0; i < validMediaItems.length; i++) {
				const mediaItem = validMediaItems[i];
				const filename = this.getFilename(mediaItem.url);
				const occ = baseOccurrence.get(filename) ?? 0; // 0-based occurrence within this basename group
				const padWidth = basePadWidth.get(filename) ?? 0;

				try {
					this.downloadStatus.set(this.translate('Gallery_DownloadingItem', [filename, (i + 1).toString(), validMediaItems.length.toString()]));
					this.downloadProgress.set(Math.round((i / validMediaItems.length) * 70)); // Reserve 30% for ZIP generation and metadata

					const mediaBlob = await this.fetchMediaAsBlob(mediaItem.url);

					// Build a deterministic, collision-safe zip path with standard suffix formatting
					const zipPath = this.buildUniqueZipPath(filename, mediaItem.url, usedNames, occ, padWidth);
					zip.file(zipPath, mediaBlob, {
						compression: mediaItem.type === 'image' || mediaItem.type === 'video' ? compressionMode : 'DEFLATE',
						binary: true,
					});

					// Record in manifest for traceability
					manifestEntries.push({ originalUrl: mediaItem.url, zipPath, filename, type: mediaItem.type });

					// Increment occurrence for this base
					baseOccurrence.set(filename, occ + 1);
				} catch (error) {
					this.logger.warn('gallery.download.failed', `Failed to download ${filename}`, error);
					// Continue with other media items
				}
			}

			this.downloadStatus.set(this.translate('Gallery_DownloadAddingMetadata'));
			this.downloadProgress.set(75);

			// Add Fuskr.txt metadata file
			const metadataContent = this.generateMetadataContent(validMediaItems);
			zip.file('Fuskr.txt', metadataContent, { compression: 'DEFLATE' });

			// Add JSON manifest mapping original URL to zip path
			const manifest = {
				version: 1,
				createdAt: new Date().toISOString(),
				totalItems: validMediaItems.length,
				entries: manifestEntries,
			};
			zip.file('manifest.json', JSON.stringify(manifest, null, 2), { compression: 'DEFLATE' });

			this.downloadStatus.set(this.translate('Gallery_DownloadCreatingZip'));
			this.downloadProgress.set(85);

			// Generate ZIP file
			const zipBlob = await zip.generateAsync({
				type: 'blob',
				compression: compressionMode,
				compressionOptions: compressionMode === 'DEFLATE' ? { level: 6 } : undefined,
			});

			this.downloadStatus.set(this.translate('Gallery_DownloadSaving'));
			this.downloadProgress.set(95);

			// Save the ZIP file
			saveAs(zipBlob, finalFilename);

			this.downloadStatus.set(this.translate('Gallery_DownloadComplete'));
			this.downloadProgress.set(100);

			this.logger.info('gallery.download.success', 'ZIP download completed successfully', {
				filename: finalFilename,
				totalItems: validMediaItems.length,
				imageCount,
				videoCount,
				compressionMode,
			});

			// Reset status after 3 seconds
			setTimeout(() => {
				this.isDownloading.set(false);
				this.downloadStatus.set('');
				this.downloadProgress.set(0);
			}, 3000);
		} catch (error) {
			this.logger.error('gallery.download.zipFailed', 'Error creating ZIP download', error);
			this.downloadStatus.set(this.translate('Gallery_DownloadFailed'));
			setTimeout(() => {
				this.isDownloading.set(false);
				this.downloadStatus.set('');
				this.downloadProgress.set(0);
			}, 3000);
		}
	}

	downloadImage(url: string, event: Event) {
		event.stopPropagation();
		const filename = this.getFilename(url);
		this.chromeService.downloadFile(url, filename);
	}

	async generateGallery(): Promise<void> {
		this.logger.info('GalleryComponent', 'generateGallery() called', { url: this.originalUrl() });
		this.errorMessage.set('');

		if (!this.originalUrl().trim()) {
			this.errorMessage.set(this.translate('Gallery_ErrorValidUrl'));
			this.logger.warn('GalleryComponent', 'Gallery generation failed: empty URL');
			return;
		}

		if (this.customCountRequested() && !this.applyCustomCountRequest()) {
			return;
		}

		this.resetInfiniteModeSessionState();

		// Check for overload protection before generating
		if (this.enableOverloadProtection()) {
			const urlCount = this.fuskrService.countPotentialUrls(this.originalUrl());
			this.logger.info('GalleryComponent', 'Overload protection check', {
				urlCount,
				limit: this.overloadProtectionLimit(),
				willTrigger: urlCount > this.overloadProtectionLimit(),
			});
			if (urlCount > this.overloadProtectionLimit()) {
				const proceed = await this.showOverloadWarning(urlCount);
				if (!proceed) return;
			}
		} else {
			this.logger.debug('GalleryComponent', 'Overload protection is disabled');
		}

		await this.performGalleryGeneration();
	}

	getAllUrlsText(): string {
		return this.allUrlsText();
	}

	/**
	 * Decode URL parameter - handles both base64 encoded and legacy URL encoded strings
	 * @param urlParam The URL parameter to decode
	 * @returns Decoded URL string
	 */
	private decodeUrlParameter(urlParam: string): string {
		try {
			// Check if the string is base64 encoded by attempting to decode and validate
			const decoded = atob(urlParam);
			// Basic validation: check if decoded string looks like a URL
			if (decoded.includes('://') || decoded.includes('http')) {
				this.logger.debug('GalleryComponent', 'Successfully decoded base64 URL parameter', {
					original: urlParam,
					decoded: decoded,
				});
				return decoded;
			}
		} catch {
			// Not base64 encoded, fall through to legacy handling
			this.logger.debug('GalleryComponent', 'URL parameter is not base64 encoded', { urlParam });
		}

		// Legacy handling: assume it might be URL encoded or plain text
		try {
			// If it contains URL encoding characters, decode it
			if (urlParam.includes('%')) {
				const decoded = decodeURIComponent(urlParam);
				this.logger.debug('GalleryComponent', 'Successfully decoded URL-encoded parameter', {
					original: urlParam,
					decoded: decoded,
				});
				return decoded;
			}
		} catch {
			this.logger.warn('GalleryComponent', 'Failed to decode URL-encoded parameter', { urlParam });
		}

		// Return the original string if no decoding worked
		this.logger.debug('GalleryComponent', 'Using URL parameter as-is (no encoding detected)', { urlParam });
		return urlParam;
	}

	getFilename(url: string): string {
		return this.fuskrService.getImageFilename(url);
	}

	getImageAltText(index: number): string {
		const url = this.visibleMediaItems()[index]?.url;
		if (url) {
			return this.getFilename(url);
		}
		return `${this.translate('Gallery_ImageAlt')} ${index + 1}`;
	}

	async loadSettings() {
		try {
			const settings = await this.chromeService.getStorageData();

			// Load existing logs BEFORE configuring — configure() internally logs
			// an INFO entry which would otherwise overwrite other contexts' logs.
			await this.logger.loadLogsFromStorage();
			this.logger.configure({
				enabled: settings.logging.enabled,
				logLevel: Number(settings.logging.logLevel),
			});

			this.logger.debug('GalleryComponent', 'Settings loaded successfully', settings);
			this.autoRemoveBrokenImages.set(settings.display.autoRemoveBrokenImages);
			this.darkMode.set(settings.display.darkMode);
			this.fullScreenGallery.set(settings.display.fullScreenGallery);
			this.imageDisplayMode.set(settings.display.imageDisplayMode);
			this.showBrokenImages.set(settings.display.toggleBrokenImages);
			this.stickyControlsCollapsed.set(settings.display.stickyControlsCollapsed);
			this.stickyControlsEnabled.set(settings.display.stickyControlsEnabled);
			this.updateStickyControlsCompression();
			this.enableOverloadProtection.set(settings.safety.enableOverloadProtection);
			this.overloadProtectionLimit.set(settings.safety.overloadProtectionLimit);
			this.logger.info('GalleryComponent', 'Overload protection configured', {
				enabled: this.enableOverloadProtection(),
				limit: this.overloadProtectionLimit(),
			});

			// Dark mode will be applied by applyDarkModeStyles() after settings are loaded
		} catch (error) {
			this.logger.error('GalleryComponent', 'Error loading settings', error);
		}
	}

	async toggleStickyControlsCollapse() {
		this.stickyControlsCollapsed.set(!this.stickyControlsCollapsed());
		this.updateStickyControlsCompression();
		await this.chromeService.updateDisplaySettings({
			stickyControlsCollapsed: this.stickyControlsCollapsed(),
		});
		this.logger.debug('GalleryComponent', 'Sticky controls collapse toggled', {
			collapsed: this.stickyControlsCollapsed(),
		});
	}

	@HostListener('window:beforeunload', ['$event'])
	handleBeforeUnload(event: BeforeUnloadEvent) {
		if (this.isDownloading()) {
			event.preventDefault();
		}
	}

	navigateToHistory() {
		if (this.isDownloading() && !confirm(this.translate('Gallery_DownloadInProgress_ConfirmLeave'))) {
			return;
		}
		this.router.navigate(['/history']);
	}

	navigateToOptions() {
		if (this.isDownloading() && !confirm(this.translate('Gallery_DownloadInProgress_ConfirmLeave'))) {
			return;
		}
		this.router.navigate(['/options']);
	}

	nextImage() {
		const visibleItems = this.visibleMediaItems();
		if (visibleItems.length === 0) {
			return;
		}

		const idx = this.currentViewerIndex();
		if (this.isInfiniteMode() && idx >= visibleItems.length - 1 - GalleryComponent.viewerInfinitePreloadDistance) {
			void this.maybeLoadMoreForward();
		}

		if (idx < visibleItems.length - 1) {
			const newIdx = idx + 1;
			this.currentViewerIndex.set(newIdx);
			this.currentViewerImage.set(visibleItems[newIdx].url);
			this.currentMediaItem.set(visibleItems[newIdx]);
			return;
		}

		if (this.isInfiniteMode() && this.canLoadMoreForward()) {
			const currentUrl = this.currentViewerImage();
			void this.advanceViewerAfterInfiniteLoad('forward', currentUrl);
		}
	}

	async ngOnInit() {
		await this.loadSettings();

		this.logger.debug('GalleryComponent', 'ngOnInit started', { hasInitialized: this.hasInitialized });

		// Ensure dark mode is applied immediately before any dialogs
		this.applyDarkModeStyles();

		// Handle both initial load and refresh scenarios
		this.route.queryParams.subscribe((params) => {
			this.logger.debug('GalleryComponent', 'queryParams subscription triggered', {
				params,
				hasInitialized: this.hasInitialized,
			});
			this.initialiseFromRouteParams(params, 'queryParams');
		});

		// Also check on immediate initialization in case queryParams subscription is delayed
		const currentParams = this.route.snapshot.queryParams;
		this.logger.debug('GalleryComponent', 'Checking snapshot params', {
			currentParams,
			hasInitialized: this.hasInitialized,
			originalUrl: this.originalUrl(),
		});
		this.initialiseFromRouteParams(currentParams, 'snapshot');
	}

	ngOnDestroy(): void {
		if (this.observerSetupTimeout) {
			clearTimeout(this.observerSetupTimeout);
			this.observerSetupTimeout = null;
		}
		if (this.scrollLoadCheckTimeout) {
			clearTimeout(this.scrollLoadCheckTimeout);
			this.scrollLoadCheckTimeout = null;
		}
		this.teardownInfiniteSentinelObservers();
	}

	@HostListener('window:scroll')
	handleWindowScroll() {
		this.updateStickyControlsCompression();

		if (!this.isInfiniteMode()) {
			return;
		}

		if (this.scrollLoadCheckTimeout) {
			clearTimeout(this.scrollLoadCheckTimeout);
		}

		this.scrollLoadCheckTimeout = setTimeout(() => {
			this.scrollLoadCheckTimeout = null;
			void this.maybeLoadMoreFromViewportEdges();
		}, 50);
	}

	private updateStickyControlsCompression(): void {
		const shouldCompress = this.stickyControlsEnabled() && !this.stickyControlsCollapsed() && this.visibleMediaItems().length > 0 && window.scrollY > 80;
		this.stickyControlsCompressed.set(shouldCompress);
	}

	async maybeLoadMoreBackward() {
		if (!this.isInfiniteMode() || this.isLoadingBackward || this.loading() || this.isGenerating()) {
			return;
		}

		if (!this.canLoadMoreBackward()) {
			return;
		}

		this.isLoadingBackward = true;
		const previousYOffset = window.scrollY;
		const galleryBefore = document.getElementById('image-gallery');
		const previousScrollHeight = galleryBefore?.scrollHeight ?? 0;

		try {
			const urls = this.collectNextBackwardUrls();
			if (urls.length === 0) {
				return;
			}

			const items = this.createMediaItemsFromUrls(urls);
			this.mediaItems.update((current) => [...items, ...current]);
			this.totalImages.set(this.mediaItems().length);
			this.initializeKeyboardNavigation();
			this.startProgressiveTypeDetectionForUrls(urls);

			setTimeout(() => {
				const galleryAfter = document.getElementById('image-gallery');
				const newScrollHeight = galleryAfter?.scrollHeight ?? previousScrollHeight;
				const prependHeightDelta = Math.max(0, newScrollHeight - previousScrollHeight);
				if (prependHeightDelta > 0) {
					window.scrollTo({ top: previousYOffset + prependHeightDelta, behavior: 'auto' });
				}
				this.scheduleInfiniteSentinelObserverSetup();
			}, 0);
		} finally {
			this.isLoadingBackward = false;
		}
	}

	async maybeLoadMoreForward() {
		if (!this.isInfiniteMode() || this.isLoadingForward || this.loading() || this.isGenerating()) {
			return;
		}

		if (!this.canLoadMoreForward()) {
			return;
		}

		this.isLoadingForward = true;
		try {
			const urls = this.collectNextForwardUrls();
			if (urls.length === 0) {
				return;
			}

			const items = this.createMediaItemsFromUrls(urls);
			this.mediaItems.update((current) => [...current, ...items]);
			this.totalImages.set(this.mediaItems().length);
			this.startProgressiveTypeDetectionForUrls(urls);
			this.scheduleInfiniteSentinelObserverSetup();
		} finally {
			this.isLoadingForward = false;
		}
	}

	onImageError(event: Event) {
		const element = event.target as HTMLImageElement | HTMLVideoElement;

		// Only process if this element hasn't been marked as error yet
		if (!element.classList.contains('error')) {
			element.classList.add('error');

			// Track the URL as broken persistently
			const originalUrl = element.getAttribute('data-original-url');
			if (originalUrl) {
				this.brokenUrls.update((s) => new Set([...s, originalUrl]));
			}

			this.updateImageCounts();

			// Auto-remove broken image/video if setting is enabled
			if (this.autoRemoveBrokenImages() || this.autoRemoveBrokenImagesSession) {
				// Remove the container from DOM immediately
				const container = element.closest('.image-item');
				if (container && originalUrl) {
					container.remove();

					// Update arrays to remove broken URL
					this.mediaItems.update((items) => items.filter((item) => item.url !== originalUrl));
					this.totalImages.set(this.mediaItems().length);

					this.logger.debug('GalleryComponent', 'Auto-removed broken media', {
						url: originalUrl,
						type: element.tagName.toLowerCase(),
						remainingItems: this.mediaItems().length,
					});

					// Update counts after removal
					this.updateImageCounts();
					void this.evaluateInfiniteContinuationGuard();
					return; // Skip the placeholder creation
				}
			}

			// For images, create a theme-aware broken image placeholder
			if (element instanceof HTMLImageElement) {
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

				if (!this.showBrokenImages()) {
					// Instead of hiding completely, reduce opacity
					element.style.opacity = '0.3';
					element.style.filter = 'grayscale(100%)';
				}

				// Always show the broken image placeholder
				element.src = brokenImageSvg;
				element.alt = this.translate('Gallery_ImageNotFound');
			}
			// For videos, just apply styling (no placeholder replacement possible)
			else if (element instanceof HTMLVideoElement) {
				if (!this.showBrokenImages()) {
					element.style.opacity = '0.3';
					element.style.filter = 'grayscale(100%)';
				}
			}

			void this.evaluateInfiniteContinuationGuard();
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

	openInTab(url: string, event: Event) {
		// Prevent event bubbling to avoid triggering other click handlers
		event.stopPropagation();
		event.preventDefault();

		// Open the URL in a new tab
		if (this.chromeService.isExtensionContext()) {
			this.chromeService.openTab(url);
		} else {
			window.open(url, '_blank');
		}
	}

	openImageViewer(url: string, index: number) {
		this.viewerTriggerElement = document.activeElement as HTMLElement;
		this.currentViewerImage.set(url);
		this.currentViewerIndex.set(index);
		// Find the media item in visibleMediaItems using the visible index
		this.currentMediaItem.set(this.visibleMediaItems()[index] || null);
		this.showImageViewer.set(true);
		// Move focus into the modal after Angular renders it
		setTimeout(() => {
			const closeBtn = document.querySelector<HTMLElement>('.viewer-content .close-btn');
			closeBtn?.focus();
		}, 0);
	}

	previousImage() {
		const visibleItems = this.visibleMediaItems();
		if (visibleItems.length === 0) {
			return;
		}

		const idx = this.currentViewerIndex();
		if (this.isInfiniteMode() && idx <= GalleryComponent.viewerInfinitePreloadDistance) {
			void this.maybeLoadMoreBackward();
		}

		if (idx > 0) {
			const newIdx = idx - 1;
			this.currentViewerIndex.set(newIdx);
			this.currentViewerImage.set(visibleItems[newIdx].url);
			this.currentMediaItem.set(visibleItems[newIdx]);
			return;
		}

		if (this.isInfiniteMode() && this.canLoadMoreBackward()) {
			const currentUrl = this.currentViewerImage();
			void this.advanceViewerAfterInfiniteLoad('backward', currentUrl);
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
				// Add to persistent broken URLs list
				this.brokenUrls.update((s) => new Set([...s, originalUrl]));
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
				// Add to persistent broken URLs list
				this.brokenUrls.update((s) => new Set([...s, originalUrl]));
			}

			// Remove the container from DOM
			const container = htmlVideo.closest('.image-item');
			if (container) {
				container.remove();
			}
		});

		// Update both arrays to remove broken URLs
		this.mediaItems.update((items) => items.filter((item) => !brokenUrls.has(item.url)));
		this.totalImages.set(this.mediaItems().length);
		this.brokenImages.set(0);

		this.logger.debug('GalleryComponent', 'Removed broken images', {
			removedCount: brokenUrls.size,
			remainingItems: this.mediaItems().length,
			totalBrokenUrls: this.brokenUrls().size,
		});

		// Enable session-based auto removal for any future failures in this gallery
		this.autoRemoveBrokenImagesSession = true;
	}

	selectAllUrls() {
		const textarea = document.querySelector('.url-textarea') as HTMLTextAreaElement;
		if (textarea) {
			textarea.select();
			textarea.setSelectionRange(0, 99999); // For mobile devices
		}
	}

	async setImageDisplayMode(mode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails') {
		this.imageDisplayMode.set(mode);

		// Save to storage
		try {
			await this.chromeService.updateDisplaySettings({ imageDisplayMode: mode });
		} catch (error) {
			this.logger.error('gallery.displayMode.saveFailed', 'Error saving display mode setting', error);
		}
	}

	async toggleBrokenImagesVisibility() {
		this.showBrokenImages.update((v) => !v);

		// Update visibility of broken images
		const brokenImages = document.querySelectorAll('img.error');
		brokenImages.forEach((img: Element) => {
			const htmlImg = img as HTMLImageElement;
			if (this.showBrokenImages()) {
				htmlImg.style.opacity = '1';
				htmlImg.style.filter = 'none';
			} else {
				htmlImg.style.opacity = '0.3';
				htmlImg.style.filter = 'grayscale(100%)';
			}
		});

		// Save to storage
		try {
			await this.chromeService.updateDisplaySettings({ toggleBrokenImages: this.showBrokenImages() });
		} catch (error) {
			this.logger.error('gallery.brokenImages.saveFailed', 'Error saving broken images setting', error);
		}
	}

	async toggleDarkMode() {
		this.darkMode.update((v) => !v);
		document.body.classList.toggle('dark-mode', this.darkMode());

		// Save to storage
		try {
			await this.chromeService.updateDisplaySettings({ darkMode: this.darkMode() });
		} catch (error) {
			this.logger.error('gallery.darkMode.saveFailed', 'Error saving dark mode setting', error);
		}
	}

	async toggleFullScreenGallery() {
		this.fullScreenGallery.update((v) => !v);

		// Save to storage
		try {
			await this.chromeService.updateDisplaySettings({ fullScreenGallery: this.fullScreenGallery() });
		} catch (error) {
			this.logger.error('gallery.fullScreenGallery.saveFailed', 'Error saving full-screen gallery setting', error);
		}
	}

	toggleInfiniteMode() {
		this.isInfiniteMode.update((enabled) => !enabled);
		if (this.isInfiniteMode()) {
			this.tryInitialiseInfinitePattern();
			this.scheduleInfiniteSentinelObserverSetup();
		} else {
			this.teardownInfiniteSentinelObservers();
		}
	}

	getViewerTotalCount(): number {
		return this.showBrokenImages() ? this.mediaItems().length : this.visibleMediaItems().length;
	}

	getInfiniteLoadedRangeLabel(): string {
		if (!this.isInfiniteMode() || this.infinitePatternBaseUrl === '') {
			return '';
		}

		const minLoaded = this.getLoadedBoundary('min');
		const maxLoaded = this.getLoadedBoundary('max');
		if (minLoaded === null || maxLoaded === null) {
			return '';
		}

		const format = (value: number) => (this.infinitePatternPadLength > 0 ? value.toString().padStart(this.infinitePatternPadLength, '0') : value.toString());
		return `${format(minLoaded)}-${format(maxLoaded)}`;
	}

	canNavigateViewerBackward(): boolean {
		return this.currentViewerIndex() > 0 || (this.isInfiniteMode() && this.canLoadMoreBackward());
	}

	canNavigateViewerForward(): boolean {
		return this.currentViewerIndex() < this.visibleMediaItems().length - 1 || (this.isInfiniteMode() && this.canLoadMoreForward());
	}

	toggleUrlList() {
		this.showUrlList.update((v) => !v);
	}

	// Keyboard navigation methods

	/**
	 * Handles keyboard navigation within the image viewer modal.
	 * Called directly from the template so events are captured even when
	 * stopPropagation would otherwise prevent them reaching the document listener.
	 */
	handleViewerKeydown(event: KeyboardEvent): void {
		event.stopPropagation();
		if (this.visibleMediaItems().length === 0) return;

		switch (event.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				this.previousImage();
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				this.nextImage();
				break;
			case 'Escape':
				event.preventDefault();
				this.closeImageViewer();
				break;
			case 'Home':
				event.preventDefault();
				this.goToFirstImageInViewer();
				break;
			case 'End':
				event.preventDefault();
				this.goToLastImageInViewer();
				break;
		}
	}

	@HostListener('document:keydown', ['$event'])
	handleKeyboardEvent(event: KeyboardEvent) {
		// Trap Tab focus within the viewer modal when it is open
		if (this.showImageViewer() && event.key === 'Tab') {
			this.trapViewerFocus(event);
			return;
		}

		// Handle modal viewer navigation — must come before the form-element guard
		// so that keys like Home/End are always captured and never reach the page.
		if (this.showImageViewer() && this.visibleMediaItems().length > 0) {
			switch (event.key) {
				case 'ArrowLeft':
				case 'ArrowUp':
					event.preventDefault();
					this.previousImage();
					break;
				case 'ArrowRight':
				case 'ArrowDown':
					event.preventDefault();
					this.nextImage();
					break;
				case 'Escape':
					event.preventDefault();
					this.closeImageViewer();
					break;
				case 'Home':
					event.preventDefault();
					this.goToFirstImageInViewer();
					break;
				case 'End':
					event.preventDefault();
					this.goToLastImageInViewer();
					break;
			}
			return;
		}

		// Don't handle main gallery navigation if focus is on a form element
		if (this.isFormElementFocused()) {
			return;
		}

		// Handle main gallery navigation
		if (this.visibleMediaItems().length === 0) {
			return;
		}

		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowLeft':
				event.preventDefault();
				this.navigateToPreviousImage();
				break;
			case 'ArrowDown':
			case 'ArrowRight':
				event.preventDefault();
				this.navigateToNextImage();
				break;
			case 'Enter':
			case ' ': // Spacebar
				event.preventDefault();
				this.openCurrentImage();
				break;
			case 'Home':
				event.preventDefault();
				this.navigateToFirstImage();
				break;
			case 'End':
				event.preventDefault();
				this.navigateToLastImage();
				break;
		}
	}

	private isFormElementFocused(): boolean {
		const activeElement = document.activeElement;
		if (!activeElement) return false;

		const formElements = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
		return formElements.includes(activeElement.tagName) || activeElement.hasAttribute('contenteditable');
	}

	/** Keeps Tab focus cycling within the image viewer modal. */
	private trapViewerFocus(event: KeyboardEvent): void {
		const modal = document.querySelector<HTMLElement>('.viewer-content');
		if (!modal) return;

		const focusableSelectors = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
		const focusable = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors));
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	private navigateToNextImage() {
		const lastIndex = this.visibleMediaItems().length - 1;
		const idx = this.currentGalleryIndex();
		this.currentGalleryIndex.set(idx < lastIndex ? idx + 1 : 0);
		this.scrollToCurrentImage();
		this.highlightCurrentImage();
	}

	private navigateToPreviousImage() {
		const lastIndex = this.visibleMediaItems().length - 1;
		const idx = this.currentGalleryIndex();
		this.currentGalleryIndex.set(idx > 0 ? idx - 1 : lastIndex);
		this.scrollToCurrentImage();
		this.highlightCurrentImage();
	}

	private navigateToFirstImage() {
		this.currentGalleryIndex.set(0);
		this.scrollToCurrentImage();
		this.highlightCurrentImage();
	}

	private navigateToLastImage() {
		this.currentGalleryIndex.set(this.visibleMediaItems().length - 1);
		this.scrollToCurrentImage();
		this.highlightCurrentImage();
	}

	private openCurrentImage() {
		const visible = this.visibleMediaItems();
		const idx = this.currentGalleryIndex();
		if (idx >= 0 && idx < visible.length) {
			const mediaItem = visible[idx];
			this.openImageViewer(mediaItem.url, idx);
		}
	}

	private goToFirstImageInViewer() {
		const visible = this.visibleMediaItems();
		this.currentViewerIndex.set(0);
		if (visible.length > 0) {
			this.currentViewerImage.set(visible[0].url);
			this.currentMediaItem.set(visible[0]);
		}
	}

	private goToLastImageInViewer() {
		const visible = this.visibleMediaItems();
		const lastIndex = visible.length - 1;
		this.currentViewerIndex.set(lastIndex);
		if (lastIndex >= 0) {
			this.currentViewerImage.set(visible[lastIndex].url);
			this.currentMediaItem.set(visible[lastIndex]);
		}
	}

	private scrollToCurrentImage() {
		const idx = this.currentGalleryIndex();
		if (idx < 0) return;

		// Find the image element by its index
		const imageElements = document.querySelectorAll('.image-item');
		const targetElement = imageElements[idx] as HTMLElement;

		if (targetElement) {
			// Scroll the element into view with smooth behavior
			targetElement.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'center',
			});
		}
	}

	private highlightCurrentImage() {
		// Remove previous highlights
		document.querySelectorAll('.image-item.keyboard-focused').forEach((el) => {
			el.classList.remove('keyboard-focused');
		});

		// Add highlight to current image
		const idx = this.currentGalleryIndex();
		if (idx >= 0) {
			const imageElements = document.querySelectorAll('.image-item');
			const targetElement = imageElements[idx];
			if (targetElement) {
				targetElement.classList.add('keyboard-focused');
			}
		}
	}

	// Private methods (alphabetically)
	private initializeKeyboardNavigation() {
		// Set initial focus to first image if gallery has items
		if (this.mediaItems().length > 0) {
			this.currentGalleryIndex.set(0);
			// Small delay to ensure DOM is updated
			setTimeout(() => {
				this.highlightCurrentImage();
			}, 100);
		}
	}

	private addToHistory() {
		// Add gallery to history after images have had time to load
		setTimeout(async () => {
			const entry = {
				originalUrl: this.originalUrl(),
				totalImages: this.totalImages(),
				loadedImages: this.loadedImages(),
				brokenImages: this.brokenImages(),
				imageUrls: [], // No longer store individual URLs - use originalUrl pattern instead
				displayMode: this.imageDisplayMode(),
			};

			try {
				await this.chromeService.addGalleryToHistory(entry);
				this.logger.info('GalleryComponent', 'Gallery added to history successfully', {
					url: this.originalUrl(),
					totalImages: this.totalImages(),
				});
			} catch (error) {
				this.logger.error('GalleryComponent', 'Failed to add gallery to history', error);
			}
		}, 2500); // Wait a bit longer than the updateImageCounts timeout to get accurate counts
	}

	private applyDarkModeStyles() {
		document.body.classList.toggle('dark-mode', this.darkMode());
		this.logger.debug('GalleryComponent', 'Dark mode styles applied', { darkMode: this.darkMode() });
	}

	private applyCustomCountRequest(): boolean {
		const count = Number.parseInt(this.customCountValue(), 10);
		if (Number.isNaN(count) || count < 0) {
			this.errorMessage.set(this.translate('Application_Prompt_NotAValidNumber'));
			return false;
		}

		const updatedUrl = this.fuskrService.createFuskUrl(this.originalUrl(), count, this.customCountDirection());
		if (updatedUrl === this.originalUrl() && !this.fuskrService.isFuskable(updatedUrl)) {
			this.errorMessage.set(this.translate('Application_Prompt_NotAValidFusk'));
			return false;
		}

		this.originalUrl.set(updatedUrl);
		this.customCountRequested.set(false);
		return true;
	}

	private async fetchMediaAsBlob(url: string): Promise<Blob> {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch media: ${response.statusText}`);
		}
		return response.blob();
	}

	private focusUrlInput() {
		const urlInput = document.querySelector(this.customCountRequested() ? '#customCountInput' : 'input[type="url"]') as HTMLInputElement | null;
		if (urlInput) {
			urlInput.focus();
			urlInput.select(); // Select any existing text
		}
	}

	private initialiseFromRouteParams(params: Record<string, unknown>, source: 'queryParams' | 'snapshot') {
		if (this.hasInitialized) {
			return;
		}

		const errorKey = typeof params['errorKey'] === 'string' ? params['errorKey'] : '';
		if (errorKey) {
			this.errorMessage.set(this.translate(errorKey));
		}

		const direction = this.parseDirectionParam(params['direction']);
		this.customCountRequested.set(params['customCount'] === '1' && direction !== null);
		if (direction !== null) {
			this.customCountDirection.set(direction);
		}

		const prefillParam = typeof params['prefill'] === 'string' ? params['prefill'] : '';
		if (prefillParam) {
			this.originalUrl.set(this.decodeUrlParameter(prefillParam));
			this.hasInitialized = true;
			this.logger.debug('GalleryComponent', 'Entering manual mode from route params', {
				source,
				customCountRequested: this.customCountRequested(),
				url: this.originalUrl(),
			});
			setTimeout(() => {
				this.focusUrlInput();
			}, 100);
			return;
		}

		const urlParam = typeof params['url'] === 'string' ? params['url'] : '';
		if (urlParam) {
			this.originalUrl.set(this.decodeUrlParameter(urlParam));
			this.hasInitialized = true;
			this.logger.info('GalleryComponent', `Starting gallery generation from ${source}`, {
				url: this.originalUrl(),
			});
			setTimeout(() => {
				this.generateGallery();
			}, 10);
			return;
		}

		this.hasInitialized = true;
		this.logger.debug('GalleryComponent', `Entering manual mode (no URL in ${source})`, {
			customCountRequested: this.customCountRequested(),
		});
		setTimeout(() => {
			this.focusUrlInput();
		}, 100);
	}

	private parseDirectionParam(directionParam: unknown): -1 | 0 | 1 | null {
		if (typeof directionParam !== 'string') {
			return null;
		}

		const parsedDirection = Number.parseInt(directionParam, 10);
		if (parsedDirection === -1 || parsedDirection === 0 || parsedDirection === 1) {
			return parsedDirection;
		}

		return null;
	}

	private generateMetadataContent(mediaItems: MediaItem[]): string {
		const lines: string[] = ['These media files were downloaded using Fuskr.', '', `Fusk Url: ${this.originalUrl() || 'Unknown'}`, '', 'Media Files:'];

		// Add each media item with type information
		mediaItems.forEach((item) => {
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
		if (this.mediaItems().length > 0) {
			return this.mediaItems().filter((item) => {
				// Only include items that are successfully loaded
				if (item.loadingState !== 'loaded') {
					return false;
				}

				// Additional DOM validation to ensure the media is actually displayed and loaded
				if (item.type === 'image') {
					const imgElement = document.querySelector(`img[src="${item.url}"]`) as HTMLImageElement;
					return imgElement && imgElement.complete && imgElement.naturalHeight !== 0 && !imgElement.classList.contains('error') && this.isValidMediaUrl(item.url);
				} else if (item.type === 'video') {
					const videoElement = document.querySelector(`video[src="${item.url}"]`) as HTMLVideoElement;
					return videoElement && videoElement.readyState >= 2 && !videoElement.classList.contains('error') && this.isValidMediaUrl(item.url);
				}

				// For unknown types, just check if the URL is valid
				return this.isValidMediaUrl(item.url);
			});
		}

		// Fallback to the old method for backward compatibility
		const validUrls = this.getValidImageUrls();
		return validUrls.map((url) => ({
			url,
			type: 'unknown' as const,
			mimeType: 'application/octet-stream',
			loadingState: 'loaded' as const,
		}));
	}

	private getValidImageUrls(): string[] {
		// Get all images and videos that are not broken and are actual media URLs (not data URLs or placeholders)
		const images = document.querySelectorAll('.fusk-image') as NodeListOf<HTMLImageElement>;
		const videos = document.querySelectorAll('.fusk-video') as NodeListOf<HTMLVideoElement>;
		const validUrls: string[] = [];

		// Process images
		images.forEach((img) => {
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
		videos.forEach((video) => {
			// Check if video has loaded successfully (not broken)
			if (video.readyState >= 2) {
				// HAVE_CURRENT_DATA or better
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

		const hasImageExtension = imageExtensions.some((ext) => urlWithoutQuery.endsWith(ext));
		const hasVideoExtension = videoExtensions.some((ext) => urlWithoutQuery.endsWith(ext));

		return hasImageExtension || hasVideoExtension;
	}

	private async performGalleryGeneration() {
		this.loading.set(true);
		this.isGenerating.set(false);
		this.errorMessage.set('');
		this.mediaItems.set([]);

		// Yield to the event loop so Angular renders the spinner before work begins.
		await new Promise<void>((resolve) => setTimeout(resolve, 0));

		try {
			const result = this.fuskrService.generateImageGallery(this.originalUrl());
			this.knownMediaUrls = new Set(result.urls);
			this.totalImages.set(result.urls.length);
			this.loadedImages.set(0);
			this.brokenImages.set(0);

			if (result.urls.length > 0) {
				this.logger.info('GalleryComponent', 'Building gallery progressively', {
					totalUrls: result.urls.length,
				});

				// Switch from the initial spinner to the in-progress build view.
				this.loading.set(false);
				this.isGenerating.set(true);

				// Add items in small batches, yielding between each so Angular can
				// render the growing list and the user sees the gallery build up.
				for (let i = 0; i < result.urls.length; i += GalleryComponent.infiniteBatchSize) {
					const batch = this.createMediaItemsFromUrls(result.urls.slice(i, i + GalleryComponent.infiniteBatchSize));
					this.mediaItems.update((items) => [...items, ...batch]);
					// Yield to event loop after each batch so Angular renders new items
					await new Promise<void>((resolve) => setTimeout(resolve, 0));
				}

				this.isGenerating.set(false);
				this.initializeKeyboardNavigation();

				this.logger.info('GalleryComponent', 'Gallery built progressively', {
					totalItems: this.mediaItems().length,
					imageCount: this.mediaItems().filter((item) => item.type === 'image').length,
					videoCount: this.mediaItems().filter((item) => item.type === 'video').length,
					unknownCount: this.mediaItems().filter((item) => item.type === 'unknown').length,
				});

				// Start progressive HTTP-based type detection in the background.
				this.startProgressiveTypeDetection();
			} else {
				this.loading.set(false);
			}

			// Do a final count after images have had time to load
			setTimeout(() => {
				this.updateImageCounts();
			}, 2000);

			// Update the URL in the browser to show the bracketed version
			if (result.originalUrl !== this.originalUrl()) {
				this.originalUrl.set(result.originalUrl);
			}

			// Update the browser URL to reflect the generated gallery
			this.updateBrowserUrl(this.originalUrl());

			// Add the gallery to history if it was successfully generated
			if (this.mediaItems().length > 0) {
				this.addToHistory();
			}

			if (this.mediaItems().length === 0) {
				this.errorMessage.set(this.translate('Gallery_ErrorNoPattern'));
				this.loading.set(false);
			} else {
				this.tryInitialiseInfinitePattern();
			}
		} catch (error) {
			this.errorMessage.set(this.translate('Gallery_ErrorGenerating') + ' ' + (error as Error).message);
			this.loading.set(false);
			this.isGenerating.set(false);
		}
	}

	private canLoadMoreBackward(): boolean {
		if (this.infinitePatternBaseUrl === '') {
			return false;
		}
		if (this.mediaItems().length >= GalleryComponent.infiniteMaxItems) {
			return false;
		}
		const minLoaded = this.getLoadedBoundary('min');
		if (minLoaded === null) {
			return false;
		}
		return minLoaded > 0;
	}

	private canLoadMoreForward(): boolean {
		if (this.infinitePatternBaseUrl === '') {
			return false;
		}
		if (this.mediaItems().length >= GalleryComponent.infiniteMaxItems) {
			return false;
		}
		const maxLoaded = this.getLoadedBoundary('max');
		if (maxLoaded === null) {
			return false;
		}
		return maxLoaded >= 0;
	}

	private collectNextBackwardUrls(): string[] {
		const minLoaded = this.getLoadedBoundary('min');
		if (minLoaded === null) {
			return [];
		}

		const from = Math.max(0, minLoaded - GalleryComponent.infiniteBatchSize);
		const urls: string[] = [];
		for (let n = from; n < minLoaded; n += this.infinitePatternStep) {
			const url = this.buildInfiniteUrl(n);
			if (url && !this.knownMediaUrls.has(url)) {
				urls.push(url);
			}
		}
		return urls;
	}

	private collectNextForwardUrls(): string[] {
		const maxLoaded = this.getLoadedBoundary('max');
		if (maxLoaded === null) {
			return [];
		}

		const to = maxLoaded + GalleryComponent.infiniteBatchSize + this.infinitePatternStep;
		const urls: string[] = [];
		for (let n = maxLoaded + this.infinitePatternStep; n < to; n += this.infinitePatternStep) {
			const url = this.buildInfiniteUrl(n);
			if (url && !this.knownMediaUrls.has(url)) {
				urls.push(url);
			}
		}
		return urls;
	}

	private createMediaItemsFromUrls(urls: string[]): MediaItem[] {
		return urls.map((url) => {
			this.knownMediaUrls.add(url);
			const mediaItem = this.mediaTypeService.createMediaItem(url);
			const fallbackResult = this.mediaTypeService.fallbackTypeDetection(url);
			return {
				...mediaItem,
				type: fallbackResult.type,
				mimeType: fallbackResult.mimeType,
				loadingState: 'loaded' as const,
			};
		});
	}

	private getLoadedBoundary(boundary: 'min' | 'max'): number | null {
		const numericValues = this.mediaItems()
			.map((item) => this.parseInfiniteNumber(item.url))
			.filter((value): value is number => value !== null);
		if (numericValues.length === 0) {
			return null;
		}
		return boundary === 'min' ? Math.min(...numericValues) : Math.max(...numericValues);
	}

	private buildInfiniteUrl(value: number): string {
		if (this.infinitePatternBaseUrl === '') {
			return '';
		}
		const formatted = this.infinitePatternPadLength > 0 ? value.toString().padStart(this.infinitePatternPadLength, '0') : value.toString();
		return this.infinitePatternBaseUrl.replace('__FUSKR_INFINITY__', formatted);
	}

	private parseInfiniteNumber(url: string): number | null {
		if (!this.infinitePatternBaseUrl || !this.infinitePatternBaseUrl.includes('__FUSKR_INFINITY__')) {
			return null;
		}

		const [prefix, suffix] = this.infinitePatternBaseUrl.split('__FUSKR_INFINITY__');
		if (!url.startsWith(prefix) || !url.endsWith(suffix)) {
			return null;
		}

		const value = url.slice(prefix.length, url.length - suffix.length);
		if (!/^\d+$/.test(value)) {
			return null;
		}

		return Number.parseInt(value, 10);
	}

	private resetInfiniteModeSessionState() {
		this.isInfiniteMode.set(false);
		this.infinitePatternBaseUrl = '';
		this.infinitePatternPadLength = 0;
		this.infinitePatternStep = 1;
		this.isLoadingBackward = false;
		this.isLoadingForward = false;
		this.isInfiniteContinuationPromptOpen = false;
		this.lastPromptedBrokenThresholdBackward = 0;
		this.lastPromptedBrokenThresholdForward = 0;
		this.knownMediaUrls = new Set();
		if (this.observerSetupTimeout) {
			clearTimeout(this.observerSetupTimeout);
			this.observerSetupTimeout = null;
		}
		if (this.scrollLoadCheckTimeout) {
			clearTimeout(this.scrollLoadCheckTimeout);
			this.scrollLoadCheckTimeout = null;
		}
		this.teardownInfiniteSentinelObservers();
	}

	private async evaluateInfiniteContinuationGuard() {
		if (!this.isInfiniteMode() || this.isInfiniteContinuationPromptOpen) {
			return;
		}

		const forwardBroken = this.getConsecutiveBrokenAtLoadedEdge('forward');
		const nextForwardThreshold = this.getNextInfiniteContinuationThreshold(this.lastPromptedBrokenThresholdForward);

		if (nextForwardThreshold !== null && forwardBroken >= nextForwardThreshold) {
			this.lastPromptedBrokenThresholdForward = nextForwardThreshold;
			const continueForward = await this.promptInfiniteContinuation('forward', forwardBroken);
			if (continueForward) {
				await this.maybeLoadMoreForward();
			}
			return;
		}

		const backwardBroken = this.getConsecutiveBrokenAtLoadedEdge('backward');
		const nextBackwardThreshold = this.getNextInfiniteContinuationThreshold(this.lastPromptedBrokenThresholdBackward);

		if (nextBackwardThreshold !== null && backwardBroken >= nextBackwardThreshold) {
			this.lastPromptedBrokenThresholdBackward = nextBackwardThreshold;
			const continueBackward = await this.promptInfiniteContinuation('backward', backwardBroken);
			if (continueBackward) {
				await this.maybeLoadMoreBackward();
			}
		}
	}

	private getNextInfiniteContinuationThreshold(lastPromptedThreshold: number): number | null {
		for (const threshold of GalleryComponent.infiniteContinuationPromptThresholds) {
			if (threshold > lastPromptedThreshold) {
				return threshold;
			}
		}

		return null;
	}

	private getConsecutiveBrokenAtLoadedEdge(direction: 'forward' | 'backward'): number {
		if (this.infinitePatternBaseUrl === '') {
			return 0;
		}

		const boundary = this.getLoadedBoundary(direction === 'forward' ? 'max' : 'min');
		if (boundary === null) {
			return 0;
		}

		const threshold = GalleryComponent.infiniteContinuationPromptThresholds[GalleryComponent.infiniteContinuationPromptThresholds.length - 1];
		let consecutiveBroken = 0;

		for (let offset = 0; offset < threshold; offset++) {
			const value = direction === 'forward' ? boundary - offset : boundary + offset;
			if (value < 0) {
				break;
			}

			const url = this.buildInfiniteUrl(value);
			if (!url || !this.knownMediaUrls.has(url) || !this.brokenUrls().has(url)) {
				break;
			}

			consecutiveBroken++;
		}

		return consecutiveBroken;
	}

	private async advanceViewerAfterInfiniteLoad(direction: 'forward' | 'backward', currentUrl: string): Promise<void> {
		if (direction === 'forward') {
			await this.maybeLoadMoreForward();
		} else {
			await this.maybeLoadMoreBackward();
		}

		const visibleItems = this.visibleMediaItems();
		const currentIndex = visibleItems.findIndex((item) => item.url === currentUrl);
		if (currentIndex === -1) {
			return;
		}

		const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
		if (nextIndex < 0 || nextIndex >= visibleItems.length) {
			return;
		}

		this.currentViewerIndex.set(nextIndex);
		this.currentViewerImage.set(visibleItems[nextIndex].url);
		this.currentMediaItem.set(visibleItems[nextIndex]);
	}

	private async promptInfiniteContinuation(direction: 'forward' | 'backward', brokenCount: number): Promise<boolean> {
		this.isInfiniteContinuationPromptOpen = true;
		try {
			const edgeLabelKey = direction === 'forward' ? 'Gallery_InfiniteContinuationEnd' : 'Gallery_InfiniteContinuationStart';
			const message = this.translate('Gallery_InfiniteContinuationPrompt', [brokenCount.toString(), this.translate(edgeLabelKey)]);
			const shouldContinue = confirm(message);

			if (!shouldContinue) {
				this.isInfiniteMode.set(false);
				this.teardownInfiniteSentinelObservers();
			}

			return shouldContinue;
		} finally {
			this.isInfiniteContinuationPromptOpen = false;
		}
	}

	private async maybeLoadMoreFromViewportEdges() {
		if (!this.isInfiniteMode() || this.loading() || this.isGenerating()) {
			return;
		}

		const viewportHeight = window.innerHeight;
		const scrollTop = window.scrollY;
		const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
		const edgeThreshold = 300;

		if (scrollTop + viewportHeight >= documentHeight - edgeThreshold) {
			await this.maybeLoadMoreForward();
		}

		if (scrollTop <= edgeThreshold) {
			await this.maybeLoadMoreBackward();
		}
	}

	private scheduleInfiniteSentinelObserverSetup() {
		if (!this.isInfiniteMode()) {
			return;
		}

		if (this.observerSetupTimeout) {
			clearTimeout(this.observerSetupTimeout);
		}

		this.observerSetupTimeout = setTimeout(() => {
			this.observerSetupTimeout = null;
			this.setupInfiniteSentinelObservers();
		}, 0);
	}

	private setupInfiniteSentinelObservers() {
		this.teardownInfiniteSentinelObservers();

		if (!this.isInfiniteMode() || this.visibleMediaItems().length === 0 || typeof IntersectionObserver === 'undefined') {
			return;
		}

		const topSentinel = document.getElementById('infinite-top-sentinel');
		const bottomSentinel = document.getElementById('infinite-bottom-sentinel');

		if (topSentinel) {
			this.backwardSentinelObserver = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							void this.maybeLoadMoreBackward();
						}
					}
				},
				{ root: null, rootMargin: '300px 0px 0px 0px', threshold: 0 }
			);
			this.backwardSentinelObserver.observe(topSentinel);
		}

		if (bottomSentinel) {
			this.forwardSentinelObserver = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							void this.maybeLoadMoreForward();
						}
					}
				},
				{ root: null, rootMargin: '0px 0px 300px 0px', threshold: 0 }
			);
			this.forwardSentinelObserver.observe(bottomSentinel);
		}
	}

	private teardownInfiniteSentinelObservers() {
		if (this.backwardSentinelObserver) {
			this.backwardSentinelObserver.disconnect();
			this.backwardSentinelObserver = null;
		}

		if (this.forwardSentinelObserver) {
			this.forwardSentinelObserver.disconnect();
			this.forwardSentinelObserver = null;
		}
	}

	private startProgressiveTypeDetectionForUrls(urls: string[]) {
		if (urls.length === 0) {
			return;
		}

		void Promise.all(
			urls.map(async (url) => {
				try {
					const result = await this.mediaTypeService.determineMediaType(url);
					this.mediaItems.update((current) => {
						const index = current.findIndex((item) => item.url === url);
						if (index === -1) {
							return current;
						}
						const item = current[index];
						if (item.type === result.type && item.mimeType === result.mimeType) {
							return current;
						}
						const next = [...current];
						next[index] = {
							...item,
							type: result.type,
							mimeType: result.mimeType,
							contentLength: result.contentLength,
							loadedAt: new Date(),
						};
						return next;
					});
				} catch {
					// Keep fallback type if HTTP detection fails.
				}
			})
		);
	}

	private tryInitialiseInfinitePattern() {
		const match = this.originalUrl().match(/^(.*?)(\[)(\d+)(-(\d+))(\])(.*)$/);
		if (!match) {
			this.infinitePatternBaseUrl = '';
			return;
		}

		const start = Number.parseInt(match[3], 10);
		const end = Number.parseInt(match[5], 10);
		const padLength = match[3].length;
		if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
			this.infinitePatternBaseUrl = '';
			return;
		}

		this.infinitePatternPadLength = padLength;
		this.infinitePatternBaseUrl = `${match[1]}__FUSKR_INFINITY__${match[7]}`;
	}

	private async showOverloadWarning(urlCount: number): Promise<boolean> {
		const message = this.translate('Gallery_OverloadWarning', [urlCount.toString(), this.overloadProtectionLimit().toString()]);
		this.logger.warn('GalleryComponent', 'Showing overload warning dialog', {
			urlCount,
			limit: this.overloadProtectionLimit(),
			message,
		});
		const proceed = confirm(message);
		this.logger.info('GalleryComponent', 'User response to overload warning', {
			proceed,
			action: proceed ? 'continue' : 'cancel',
		});

		if (proceed) {
			this.logger.info('GalleryComponent', 'User chose to proceed with gallery generation despite warning');
		} else {
			this.logger.info('GalleryComponent', 'User chose to cancel gallery generation');
		}

		return proceed;
	}

	private updateBrowserUrl(url: string) {
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				customCount: null,
				direction: null,
				errorKey: null,
				prefill: null,
				url: btoa(url),
			},
		});
	}

	private updateImageCounts() {
		// Count both images and videos from DOM
		const allImages = document.querySelectorAll('.fusk-image') as NodeListOf<HTMLImageElement>;
		const allVideos = document.querySelectorAll('.fusk-video') as NodeListOf<HTMLVideoElement>;
		let loaded = 0;
		let broken = 0;

		// Count images
		allImages.forEach((img) => {
			if (img.classList.contains('error')) {
				broken++;
			} else if (img.complete && img.naturalHeight !== 0 && !img.src.startsWith('data:')) {
				loaded++;
			}
		});

		// Count videos
		allVideos.forEach((video) => {
			if (video.classList.contains('error')) {
				broken++;
			} else if (video.readyState >= 2 && !video.src.startsWith('data:')) {
				// HAVE_CURRENT_DATA or better
				loaded++;
			}
		});

		this.loadedImages.set(loaded);
		this.brokenImages.set(broken);
	}

	private async startProgressiveTypeDetection() {
		// Start progressive HTTP-based type detection in the background
		// This will update media items one by one as HTTP requests complete
		this.logger.info('GalleryComponent', 'Starting progressive media type detection', {
			totalItems: this.mediaItems().length,
		});

		const concurrencyLimit = 3; // Lower concurrency to be more respectful and faster
		const items = this.mediaItems();

		for (let i = 0; i < items.length; i += concurrencyLimit) {
			const batch = items.slice(i, i + concurrencyLimit);

			// Process batch in parallel
			const updatePromises = batch.map(async (mediaItem) => {
				try {
					// Make HTTP request to get actual media type
					const result = await this.mediaTypeService.determineMediaType(mediaItem.url);

					// Update the mediaItem in place only if the type changed
					if (result.type !== mediaItem.type || result.mimeType !== mediaItem.mimeType) {
						this.mediaItems.update((current) => {
							const index = current.findIndex((item) => item?.url === mediaItem.url);
							if (index === -1) {
								return current;
							}

							const existing = current[index];
							if (!existing) {
								return current;
							}

							const next = [...current];
							next[index] = {
								...existing,
								type: result.type,
								mimeType: result.mimeType,
								contentLength: result.contentLength,
								loadedAt: new Date(),
							};
							return next;
						});

						this.logger.debug('GalleryComponent', 'Updated media type via HTTP', {
							url: mediaItem.url.substring(0, 50) + '...',
							oldType: mediaItem.type,
							newType: result.type,
							oldMimeType: mediaItem.mimeType,
							newMimeType: result.mimeType,
						});
					}
				} catch (error) {
					// Keep the fallback detection, just log the failure
					this.logger.debug('GalleryComponent', 'HTTP type detection failed, keeping fallback', {
						url: mediaItem.url.substring(0, 50) + '...',
						error: error instanceof Error ? error.message : String(error),
					});
				}
			});

			// Wait for this batch to complete
			await Promise.all(updatePromises);

			// Small delay between batches to be respectful to servers
			if (i + concurrencyLimit < items.length) {
				await new Promise((resolve) => setTimeout(resolve, 50));
			}
		}

		this.logger.info('GalleryComponent', 'Progressive media type detection completed', {
			totalItems: this.mediaItems().length,
			imageCount: this.mediaItems().filter((item) => item.type === 'image').length,
			videoCount: this.mediaItems().filter((item) => item.type === 'video').length,
			unknownCount: this.mediaItems().filter((item) => item.type === 'unknown').length,
		});
	}

	// Helper: build unique zip path with suffix numbering for duplicates (e.g., "name (002).jpg")
	private buildUniqueZipPath(baseFilename: string, originalUrl: string, usedNames: Map<string, number>, occurrenceIndex: number, padWidth: number): string {
		const dot = baseFilename.lastIndexOf('.');
		const name = dot > -1 ? baseFilename.slice(0, dot) : baseFilename;
		const ext = dot > -1 ? baseFilename.slice(dot) : '';

		// First occurrence keeps the original name
		if (occurrenceIndex === 0) {
			if (!usedNames.has(baseFilename)) {
				usedNames.set(baseFilename, 1);
				return baseFilename;
			}
			// Extremely unlikely collision on first occurrence: fall through to suffix logic
		}

		// Subsequent occurrences: standard suffix " (NNN)" where NNN is 2..N, zero-padded to padWidth when padWidth > 1
		const n = occurrenceIndex + 1; // 1-based count
		const displayNum = n.toString().padStart(Math.max(2, padWidth), '0');
		let candidate = `${name} (${displayNum})${ext}`;
		let counter = 1;
		while (usedNames.has(candidate)) {
			counter += 1;
			candidate = `${name} (${displayNum})-${counter}${ext}`;
		}
		usedNames.set(candidate, 1);
		return candidate;
	}

	// Helper: small, fast, deterministic hash → short hex, stable across runs
	private shortHash(input: string, length = 6): string {
		let hash = 2166136261; // FNV-1a 32-bit offset basis
		for (let i = 0; i < input.length; i++) {
			hash ^= input.charCodeAt(i);
			hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
		}
		const hex = (hash >>> 0).toString(16).padStart(8, '0');
		return hex.slice(0, Math.max(1, Math.min(8, length)));
	}

	// Decide compression mode: images/videos are already compressed; for large galleries, avoid recompression
	private getZipCompressionMode(totalItems: number): 'STORE' | 'DEFLATE' {
		// Threshold chosen pragmatically; can be refined or made configurable later
		return totalItems >= 300 ? 'STORE' : 'DEFLATE';
	}

	/** Displays a brief toast notification that auto-dismisses after 2.5 seconds. */
	private showToast(message: string, isError = false): void {
		if (this.toastTimeout !== null) {
			clearTimeout(this.toastTimeout);
		}
		this.toastMessage.set(message);
		this.toastVisible.set(true);
		if (isError) {
			this.toastMessage.set(message);
		}
		this.toastTimeout = setTimeout(() => {
			this.toastVisible.set(false);
			this.toastTimeout = null;
		}, 2500);
	}
}
