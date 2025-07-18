import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuskrService } from '../services/fuskr.service';
import { ChromeService } from '../services/chrome.service';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    standalone: false
})
export class GalleryComponent implements OnInit {
	originalUrl: string = '';
	imageUrls: string[] = [];
	loading: boolean = false;
	errorMessage: string = '';
	
	// Image tracking
	loadedImages: number = 0;
	brokenImages: number = 0;
	totalImages: number = 0;
	
	// UI state
	showBrokenImages: boolean = false;
	showImageViewer: boolean = false;
	currentViewerImage: string = '';
	currentViewerIndex: number = 0;
	
	// Settings
	darkMode: boolean = false;
	imageDisplayMode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails' = 'fitOnPage';

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private fuskrService: FuskrService,
		private chromeService: ChromeService
	) {}

	async ngOnInit() {
		await this.loadSettings();
		
		// Handle both initial load and refresh scenarios
		this.route.queryParams.subscribe(params => {
			if (params['url']) {
				this.originalUrl = params['url'];
				this.generateGallery();
			}
		});
		
		// Also check on immediate initialization in case queryParams subscription is delayed
		const currentParams = this.route.snapshot.queryParams;
		if (currentParams['url'] && !this.originalUrl) {
			this.originalUrl = currentParams['url'];
			this.generateGallery();
		}
	}

	async loadSettings() {
		try {
			const settings = await this.chromeService.getStorageData();
			this.darkMode = settings.darkMode || false;
			this.imageDisplayMode = settings.imageDisplayMode || 'fitOnPage';
			this.showBrokenImages = settings.toggleBrokenImages || false;
			
			// Apply dark mode class to document
			document.body.classList.toggle('dark-mode', this.darkMode);
		} catch (error) {
			console.error('Error loading settings:', error);
		}
	}

	generateGallery() {
		if (!this.originalUrl.trim()) {
			this.errorMessage = 'Please enter a valid URL';
			return;
		}

		this.loading = true;
		this.errorMessage = '';
		this.imageUrls = [];

		try {
			const result = this.fuskrService.generateImageGallery(this.originalUrl);
			this.imageUrls = result.urls;
			this.totalImages = this.imageUrls.length;
			this.loadedImages = 0;
			this.brokenImages = 0;
		
			// Update the URL in the browser to show the bracketed version
			if (result.originalUrl !== this.originalUrl) {
				this.originalUrl = result.originalUrl;
				this.router.navigate([], {
					relativeTo: this.route,
					queryParams: { url: result.originalUrl },
					queryParamsHandling: 'merge'
				});
			}
		
			if (this.imageUrls.length === 0) {
				this.errorMessage = 'No fuskable pattern found in the URL. Try a URL with numbers in the filename.';
			}
		} catch (error) {
			this.errorMessage = 'Error generating gallery: ' + (error as Error).message;
		} finally {
			this.loading = false;
		}
	}

	openImage(url: string) {
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

		try {
			for (const url of this.imageUrls) {
			const filename = this.getFilename(url);
			await this.chromeService.downloadFile(url, filename);
			// Small delay to avoid overwhelming the browser
			await new Promise(resolve => setTimeout(resolve, 100));
			}
		} catch (error) {
			console.error('Error downloading images:', error);
		}
	}

	copyUrl(url: string, event: Event) {
		event.stopPropagation();
		navigator.clipboard.writeText(url).then(() => {
			// Could show a toast notification here
			console.log('URL copied to clipboard');
		});
	}

	getFilename(url: string): string {
		return this.fuskrService.getImageFilename(url);
	}

	onImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.classList.add('error');
		this.brokenImages++;
		
		// Create a more visible broken image placeholder
		const brokenImageSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
			<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
				<rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
				<text x="50%" y="45%" font-family="Arial, sans-serif" font-size="16" fill="#6c757d" text-anchor="middle" dominant-baseline="middle">Image not found</text>
				<text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" fill="#adb5bd" text-anchor="middle" dominant-baseline="middle">🚫</text>
			</svg>
		`)}`;
		
		if (!this.showBrokenImages) {
			// Instead of hiding completely, reduce opacity
			img.style.opacity = '0.3';
			img.style.filter = 'grayscale(100%)';
		}
		
		// Always show the broken image placeholder
		img.src = brokenImageSvg;
		img.alt = 'Image not found';
	}

	onImageLoad(event: Event) {
		this.loadedImages++;
	}

	async toggleDarkMode() {
		this.darkMode = !this.darkMode;
		document.body.classList.toggle('dark-mode', this.darkMode);
		
		// Save to storage
		try {
			const settings = await this.chromeService.getStorageData();
			settings.darkMode = this.darkMode;
			await this.chromeService.setStorageData(settings);
		} catch (error) {
			console.error('Error saving dark mode setting:', error);
		}
	}

	async setImageDisplayMode(mode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails') {
		this.imageDisplayMode = mode;
		
		// Save to storage
		try {
			const settings = await this.chromeService.getStorageData();
			settings.imageDisplayMode = mode;
			await this.chromeService.setStorageData(settings);
		} catch (error) {
			console.error('Error saving display mode setting:', error);
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
			const settings = await this.chromeService.getStorageData();
			settings.toggleBrokenImages = this.showBrokenImages;
			await this.chromeService.setStorageData(settings);
		} catch (error) {
			console.error('Error saving broken images setting:', error);
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
		const brokenImages = document.querySelectorAll('img.error');
		brokenImages.forEach((img: Element) => {
			const container = img.closest('.image-item');
			if (container) {
				container.remove();
			}
		});
		// Update the URLs array to reflect removed images
		this.imageUrls = this.imageUrls.filter((_, index) => {
			const img = document.querySelector(`img[alt="Image ${index + 1}"]`);
			return img && !img.classList.contains('error');
		});
		this.totalImages = this.imageUrls.length;
		this.brokenImages = 0;
	}
}
