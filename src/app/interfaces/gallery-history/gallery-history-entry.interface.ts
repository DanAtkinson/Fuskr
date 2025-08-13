export interface GalleryHistoryEntry {
	id: string; // Unique identifier for the entry
	originalUrl: string; // The fusk URL that was used
	timestamp: Date; // When the gallery was created
	totalImages: number; // Total number of URLs generated
	loadedImages: number; // Number of images that loaded successfully
	brokenImages: number; // Number of images that failed to load
	imageUrls: string[]; // The actual URLs that were generated
	displayMode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails'; // How it was displayed
}
