import { GalleryHistory } from '@interfaces/gallery-history/gallery-history.interface';

export interface IBehaviourSettings {
	galleryHistory: GalleryHistory;
	keepRecentFusks: boolean;
	openInForeground: boolean;
	recentFusks: string[];
}
