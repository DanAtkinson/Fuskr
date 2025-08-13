import { Injectable } from '@angular/core';
import { MediaItem, MediaTypeResult } from '@interfaces/media';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class MediaTypeService {
  constructor(private logger: LoggerService) {}

  /**
   * Creates a MediaItem from a URL with initial metadata
   */
  createMediaItem(url: string): MediaItem {
    const extension = this.extractExtension(url);

    return {
      url,
      type: 'unknown',
      mimeType: 'application/octet-stream',
      loadingState: 'pending',
      extension,
    };
  }

  /**
   * Determines media type by making a HEAD request to check Content-Type header
   */
  async determineMediaType(url: string): Promise<MediaTypeResult> {
    try {
      // Use HEAD request to get headers without downloading content
      const response = await fetch(url, {
        method: 'HEAD',
        // Add cache control to avoid unnecessary requests
        cache: 'force-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
      const contentLengthHeader = response.headers.get('Content-Length');
      const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : undefined;

      // Determine type from Content-Type header
      const type = this.getTypeFromMimeType(contentType);

      this.logger.debug('MediaTypeService', 'Media type determined via HEAD request', {
        url: url.substring(0, 100) + (url.length > 100 ? '...' : ''),
        contentType,
        type,
        contentLength,
      });

      return {
        type,
        mimeType: contentType,
        contentLength,
      };
    } catch (error) {
      this.logger.warn('MediaTypeService', 'Failed to determine media type via HEAD request', {
        url: url.substring(0, 100) + (url.length > 100 ? '...' : ''),
        error: error instanceof Error ? error.message : String(error),
      });

      // Fallback to URL extension-based detection
      return this.fallbackTypeDetection(url);
    }
  }

  /**
   * Updates a MediaItem with type information from HTTP headers
   */
  async updateMediaItemType(mediaItem: MediaItem): Promise<MediaItem> {
    mediaItem.loadingState = 'loading';

    try {
      const result = await this.determineMediaType(mediaItem.url);

      return {
        ...mediaItem,
        type: result.type,
        mimeType: result.mimeType,
        contentLength: result.contentLength,
        loadingState: 'loaded',
        loadedAt: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        ...mediaItem,
        loadingState: 'error',
        errorMessage,
        loadedAt: new Date(),
      };
    }
  }

  /**
   * Batch process multiple URLs to determine their media types
   */
  async batchDetermineMediaTypes(urls: string[], concurrencyLimit: number = 5): Promise<MediaItem[]> {
    const mediaItems = urls.map((url) => this.createMediaItem(url));

    // Process in batches to avoid overwhelming the server
    const results: MediaItem[] = [];

    for (let i = 0; i < mediaItems.length; i += concurrencyLimit) {
      const batch = mediaItems.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map((item) => this.updateMediaItemType(item));

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        this.logger.debug('MediaTypeService', 'Processed media type batch', {
          batchStart: i,
          batchSize: batch.length,
          totalProcessed: results.length,
          totalItems: mediaItems.length,
        });

        // Small delay between batches to be respectful to servers
        if (i + concurrencyLimit < mediaItems.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        this.logger.error('MediaTypeService', 'Error processing batch', {
          batchStart: i,
          error: error instanceof Error ? error.message : String(error),
        });

        // Add failed items with error state
        const failedItems = batch.map((item) => ({
          ...item,
          loadingState: 'error' as const,
          errorMessage: 'Batch processing failed',
        }));
        results.push(...failedItems);
      }
    }

    return results;
  }

  /**
   * Determines media type from MIME type string
   */
  private getTypeFromMimeType(mimeType: string): 'image' | 'video' | 'unknown' {
    const cleanMimeType = mimeType.toLowerCase().split(';')[0].trim();

    if (cleanMimeType.startsWith('image/')) {
      return 'image';
    }

    if (cleanMimeType.startsWith('video/')) {
      return 'video';
    }

    // Some servers might use non-standard MIME types
    const knownImageTypes = [
      'application/octet-stream', // Sometimes used for images
    ];

    const knownVideoTypes = [
      'application/mp4', // Sometimes used instead of video/mp4
    ];

    if (knownImageTypes.includes(cleanMimeType)) {
      // For octet-stream, we'll need to fall back to URL analysis
      return 'unknown';
    }

    if (knownVideoTypes.includes(cleanMimeType)) {
      return 'video';
    }

    return 'unknown';
  }

  /**
   * Fallback method using URL extension when Content-Type is unavailable
   */
  private fallbackTypeDetection(url: string): MediaTypeResult {
    const extension = this.extractExtension(url);

    if (!extension) {
      return {
        type: 'unknown',
        mimeType: 'application/octet-stream',
      };
    }

    const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'tiff', 'tif']);

    const videoExtensions = new Set(['mp4', 'webm', 'ogv', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'm4v', '3gp', 'ogg']);

    if (imageExtensions.has(extension)) {
      return {
        type: 'image',
        mimeType: this.getMimeTypeFromExtension(extension, 'image'),
      };
    }

    if (videoExtensions.has(extension)) {
      return {
        type: 'video',
        mimeType: this.getMimeTypeFromExtension(extension, 'video'),
      };
    }

    return {
      type: 'unknown',
      mimeType: 'application/octet-stream',
    };
  }

  /**
   * Extracts file extension from URL
   */
  private extractExtension(url: string): string | undefined {
    try {
      const urlWithoutQuery = url.split('?')[0];

      // Try using URL constructor for proper pathname extraction
      try {
        const pathname = new URL(urlWithoutQuery).pathname;
        const lastSegment = pathname.split('/').pop() || '';
        const dotIndex = lastSegment.lastIndexOf('.');

        if (dotIndex > 0 && dotIndex < lastSegment.length - 1) {
          return lastSegment.substring(dotIndex + 1).toLowerCase();
        }
      } catch (urlError) {
        // Fallback to simple splitting if URL constructor fails
        const parts = urlWithoutQuery.split('.');
        if (parts.length > 1) {
          const extension = parts[parts.length - 1];
          // Make sure it's not a domain extension
          if (extension && !extension.includes('/')) {
            return extension.toLowerCase();
          }
        }
      }
    } catch (error) {
      // Invalid URL, return undefined
    }
    return undefined;
  }

  /**
   * Gets MIME type from file extension as fallback
   */
  private getMimeTypeFromExtension(extension: string, type: 'image' | 'video'): string {
    if (type === 'image') {
      const imageMimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        bmp: 'image/bmp',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
        tiff: 'image/tiff',
        tif: 'image/tiff',
      };
      return imageMimeTypes[extension] || 'image/jpeg';
    }

    if (type === 'video') {
      const videoMimeTypes: Record<string, string> = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogv: 'video/ogg',
        avi: 'video/x-msvideo',
        mov: 'video/quicktime',
        mkv: 'video/x-matroska',
        flv: 'video/x-flv',
        wmv: 'video/x-ms-wmv',
        m4v: 'video/mp4',
        '3gp': 'video/3gpp',
        ogg: 'video/ogg',
      };
      return videoMimeTypes[extension] || 'video/mp4';
    }

    return 'application/octet-stream';
  }
}
