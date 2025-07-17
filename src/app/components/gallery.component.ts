import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuskrService } from '../services/fuskr.service';
import { ChromeService } from '../services/chrome.service';

@Component({
	selector: 'app-gallery',
	templateUrl: './gallery.component.html',
	styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
	originalUrl: string = '';
	imageUrls: string[] = [];
	loading: boolean = false;
	errorMessage: string = '';

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private fuskrService: FuskrService,
		private chromeService: ChromeService
	) {}

	ngOnInit() {
		this.route.queryParams.subscribe(params => {
			if (params['url']) {
			this.originalUrl = params['url'];
			this.generateGallery();
			}
		});
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
		img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD4KPC9zdmc+';
	}
}
