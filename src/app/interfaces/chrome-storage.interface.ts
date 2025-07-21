export interface IDisplaySettings {
	darkMode: boolean;
	imageDisplayMode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails';
	resizeImagesToFillPage: boolean;
	resizeImagesToFitOnPage: boolean;
	resizeImagesToFullWidth: boolean;
	resizeImagesToThumbnails: boolean;
	showImagesInViewer: boolean;
	toggleBrokenImages: boolean;
}

export interface IBehaviourSettings {
	galleryHistory: import('./gallery-history.interface').GalleryHistory;
	keepRecentFusks: boolean;
	openInForeground: boolean;
	recentFusks: string[];
}

export interface ISafetySettings {
	enableOverloadProtection: boolean;
	overloadProtectionLimit: number;
}

export interface IChromeStorageData {
	behaviour: IBehaviourSettings;
	display: IDisplaySettings;
	safety: ISafetySettings;
	version: number;
}
