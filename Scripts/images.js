;(function() {

	var app = angular.module('fuskrApp');

	app.config(function($stateProvider, $urlRouterProvider) {

		$stateProvider
			.state('main', {
				url: "/fusk/{path:.*}",
				templateUrl: "/Html/partials/imagelist.html",
				controller: "ImageListController",
				onEnter: function($rootScope, $stateParams) {
					$rootScope.pageTitle = $stateParams.path.replace(/(https*:)*\/\/(www\.)*/i, "");
					$rootScope.originalUrl = $stateParams.path;
				},
				resolve: {
					images: function(fuskrService, $stateParams) {
						return fuskrService.getLinks($stateParams.path);
					}
				}
			});
	});

	app.controller('ImageDownloadController', function($scope, images, helpers) {
		$scope.conflictResolution = helpers.getStorage('conflictResolution', 'uniquify');
		$scope.downloadAll = downloadAll;

		function downloadAll() {
			saveToStorage('conflictResolution', $scope.conflictResolution);

			images.forEach(function(image) {
				chrome.downloads.download({
					url: image.url,
					conflictAction: $scope.conflictResolution
				});
			});

			$scope.$close();
		}

		// TODO: Replace this with a directive to auto-save to storage
		function saveToStorage(name, value) {
			if (typeof(value) == "boolean") value = value ? 1 : 0;
			helpers.setStorage(name, value);
		}
	});

	app.controller('ImageListController', function($document, $rootScope, $scope, helpers, images, Popeye) {

		// An array of image objects
		$scope.images = images;
		$scope.filteredImages = images;
		$scope.selectedImageId = 0;

		// Page options
		$scope.showViewer = false;
		$scope.showBrokenImages = false;
		$scope.fullWidthImages = false;

		// Lambda functions
		$scope.totalSuccess = () => $scope.images.map(x => x.loaded && x.success ? 1 : 0).reduce((a, b) => a + b);
		$scope.totalFailed = () => $scope.images.map(x => x.loaded && !x.success ? 1 : 0).reduce((a, b) => a + b);
		$scope.isFinishedLoading = () => $scope.images.every(x => x.loaded);

		// Scoped functions
		$scope.pluraliseForImages = pluraliseForImages;
		$scope.shouldDisplayImage = shouldDisplayImage;
		$scope.scrollToAnchor = scrollToAnchor;
		$scope.download = download;
		$scope.downloadZip = downloadZip;

		$document.bind('keydown', keyboardBinding);

		function scrollToAnchor(htmlElementId, itemId) {
			if (itemId < 0 || !itemId) itemId = 0;
			if (itemId > $scope.filteredImages.length - 1) itemId = $scope.filteredImages.length - 1;

			$scope.selectedImageId = itemId;

			if (htmlElementId) helpers.scrollTo(htmlElementId);
		};

		function shouldDisplayImage() {
			return function(img) {
				return !img.loaded || img.success || $scope.showBrokenImages;
			};
		}

		function pluraliseForImages(key) {
			return {
				'0': helpers.translate(key),
				'one': helpers.translate(key),
				'other': helpers.translate(key)
			}
		}

		function keyboardBinding(e) {
			switch (e.which) {
				case 37:
					/* Left */
					e.preventDefault();
					$scope.$apply(function() {
						scrollToAnchor(false ? null : 'image' + ($scope.selectedImageId - 1), $scope.selectedImageId - 1)
					});
					break;
				case 39:
					/* Right */
					e.preventDefault();
					$scope.$apply(function() {
						scrollToAnchor(false ? null : 'image' + ($scope.selectedImageId + 1), $scope.selectedImageId + 1)
					});
					break;
				case 27:
					/* Escape */
					e.preventDefault();
					$scope.$apply(function() {
						$scope.showViewer = !$scope.showViewer;
					});
					break;
			}
		};

		function download() {

			var validImages = $scope.images.filter(x => x.loaded && x.success);

			var modal = Popeye.openModal({
				templateUrl: "/Html/partials/download.html",
				controller: "ImageDownloadController",
				resolve: {
					images: function($http) {
						return validImages;
					}
				}
			});
		};

		function downloadZip(){
			var zip = new JSZip();
			zip.file("Fuskr.txt", "These images were downloaded using Fuskr.\r\n\r\nFusk URL: " + $rootScope.originalUrl);

			var validImages = $scope.images.filter(x => x.loaded && x.success);

			validImages.forEach(function(img){
				zip.file(img.url.split('/').pop(), img.data, {blob: true});
			})

			zip.generateAsync({type:"blob"})
			.then(function(content) {
				saveAs(content, "fuskr.zip");
			});
         }
	});
}());
