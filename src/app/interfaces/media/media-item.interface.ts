/**
 * Represents a media item in the gallery with metadata determined from HTTP headers
 */
export interface MediaItem {
	/** The URL of the media item */
	url: string;

	/** The type of media determined from Content-Type header */
	type: 'image' | 'video' | 'unknown';

	/** The MIME type from the Content-Type header */
	mimeType: string;

	/** Loading state of the media item */
	loadingState: 'pending' | 'loading' | 'loaded' | 'error';

	/** File extension (if available from URL) */
	extension?: string;

	/** Content length from Content-Length header (if available) */
	contentLength?: number;

	/** Error message if loading failed */
	errorMessage?: string;

	/** Timestamp when metadata was loaded */
	loadedAt?: Date;
}
