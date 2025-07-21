import {
	IChromeStorageData,
	IDisplaySettings,
	IBehaviourSettings,
	ISafetySettings
} from '../interfaces/chrome-storage.interface';
import { GalleryHistory } from '../interfaces/gallery-history.interface';

export class DisplaySettings implements IDisplaySettings {
	// Public properties (alphabetically)
	darkMode: boolean = false;
	imageDisplayMode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails' = 'fitOnPage';
	resizeImagesToFillPage: boolean = false;
	resizeImagesToFitOnPage: boolean = true;
	resizeImagesToFullWidth: boolean = false;
	resizeImagesToThumbnails: boolean = false;
	showImagesInViewer: boolean = true;
	toggleBrokenImages: boolean = true;

	constructor(data?: Partial<IDisplaySettings>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}

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

export class SafetySettings implements ISafetySettings {
	// Public properties (alphabetically)
	enableOverloadProtection: boolean = true;
	overloadProtectionLimit: number = 50;

	constructor(data?: Partial<ISafetySettings>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}

export class ChromeStorageData implements IChromeStorageData {
	// Public properties (alphabetically)
	behaviour: BehaviourSettings;
	display: DisplaySettings;
	safety: SafetySettings;
	version: number = 1;

	constructor(data?: Partial<IChromeStorageData>) {
		this.display = new DisplaySettings(data?.display);
		this.behaviour = new BehaviourSettings(data?.behaviour);
		this.safety = new SafetySettings(data?.safety);

		if (data?.version !== undefined) {
			this.version = data.version;
		}
	}
}
