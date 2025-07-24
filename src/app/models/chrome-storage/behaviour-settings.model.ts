import { IBehaviourSettings } from '@interfaces/chrome-storage/behaviour-settings.interface';
import { GalleryHistory } from '@interfaces/gallery-history/gallery-history.interface';

export class BehaviourSettings implements IBehaviourSettings {
	// Public properties (alphabetically)
	galleryHistory: GalleryHistory = {
		entries: [],
		maxEntries: 10
	};
	keepRecentFusks: boolean = true;
	openInForeground: boolean = true;
	recentFusks: string[] = [];

	constructor(data?: Partial<IBehaviourSettings>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
