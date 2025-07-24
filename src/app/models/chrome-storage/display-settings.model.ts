import { IDisplaySettings } from '@interfaces/chrome-storage/display-settings.interface';

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
