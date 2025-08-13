import { GalleryHistoryEntry } from './gallery-history-entry.interface';

export interface GalleryHistory {
	entries: GalleryHistoryEntry[];
	maxEntries: number; // Maximum number of entries to keep
}
