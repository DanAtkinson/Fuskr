import { IDisplaySettings } from '@interfaces/chrome-storage/display-settings.interface';

export class DisplaySettings implements IDisplaySettings {
	// Public properties (alphabetically)
	darkMode = false;
	imageDisplayMode: 'fitOnPage' | 'fullWidth' | 'fillPage' | 'thumbnails' = 'fitOnPage';
	resizeImagesToFillPage = false;
	resizeImagesToFitOnPage = true;
	resizeImagesToFullWidth = false;
	resizeImagesToThumbnails = false;
	showImagesInViewer = true;
	toggleBrokenImages = true;

	constructor(data?: Partial<IDisplaySettings>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
