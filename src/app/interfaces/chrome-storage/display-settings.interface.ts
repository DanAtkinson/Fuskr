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
