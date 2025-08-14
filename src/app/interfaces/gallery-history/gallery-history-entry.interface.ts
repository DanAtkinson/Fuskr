export interface GalleryHistoryEntry {
	id: string; // Unique identifier for the entry
	originalUrl: string; // The fusk URL pattern that was used (used to regenerate gallery)
	timestamp: Date; // When the gallery was created
	totalImages: number; // Total number of URLs generated
	loadedImages: number; // Number of images that loaded successfully
	brokenImages: number; // Number of images that failed to load
	imageUrls: string[]; // Deprecated: kept for compatibility, always empty array
	displayMode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails'; // How it was displayed
}
