/**
 * Media type determination result
 */
export interface MediaTypeResult {
	type: 'image' | 'video' | 'unknown';
	mimeType: string;
	contentLength?: number;
}
