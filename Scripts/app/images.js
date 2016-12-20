/* globals JSZip, saveAs */

(function () {

    var app = angular.module('fuskrApp');

    app.controller('ImageListController', function ($document, $rootScope, $scope, $location, $filter, anchorScrollService, fuskrService) {

        var url = $location.hash();
        var images = fuskrService.getLinks(url);

        // An array of image objects
        $scope.images = images;
        $scope.filteredImages = images;
        $scope.selectedImageId = 0;
        $scope.originalUrl = url;

        // Page options
        $scope.showViewer = false;
        $scope.showBrokenImages = false;
        $scope.fullWidthImages = false;

        // Lambda functions
        $scope.totalSuccess = function () {
                return $scope.images.map(function (x) {
                    return x.loaded && x.success ? 1 : 0;
                }).reduce(function (a, b) {
                    return a + b;
                }, 0);
            };

        $scope.totalFailed = function () {
                return $scope.images.map(function (x) {
                    return x.loaded && !x.success ? 1 : 0;
                }).reduce(function (a, b) {
                    return a + b;
                }, 0);
            };

        $scope.isFinishedLoading = function () {
                return $scope.images.every(function (x) { return x.loaded; });
            };

        // Scoped functions
        $scope.pluraliseForImages = pluraliseForImages;
        $scope.shouldDisplayImage = shouldDisplayImage;
        $scope.scrollToAnchor = scrollToAnchor;
        $scope.downloadZip = downloadZip;

        $document.bind('keydown', keyboardBinding);

        function scrollToAnchor(htmlElementId, itemId) {
            if (itemId < 0 || !itemId) {
                itemId = 0;
            }

            if (itemId > $scope.filteredImages.length - 1) {
                itemId = $scope.filteredImages.length - 1;
            }

            $scope.selectedImageId = itemId;

            if (htmlElementId) {
                anchorScrollService.scrollTo(htmlElementId);
            }
        }

        function shouldDisplayImage() {
            return function (img) {
                return !img.loaded || img.success || $scope.showBrokenImages;
            };
        }

        function pluraliseForImages(key) {
            return {
                0: $filter('translate')(key),
                one: $filter('translate')(key),
                other: $filter('translate')(key)
            };
        }

        function keyboardBinding(e) {
            switch (e.which) {
                case 37:
                    /* Left */
                    e.preventDefault();
                    $scope.$apply(function () {
                        scrollToAnchor(false ? null : 'image' + ($scope.selectedImageId - 1), $scope.selectedImageId - 1);
                    });
                break;
                case 39:
                    /* Right */
                    e.preventDefault();
                    $scope.$apply(function () {
                        scrollToAnchor(false ? null : 'image' + ($scope.selectedImageId + 1), $scope.selectedImageId + 1);
                    });
                break;
                case 27:
                    /* Escape */
                    e.preventDefault();
                    $scope.$apply(function () {
                        $scope.showViewer = !$scope.showViewer;
                    });
                break;
            }
        }

        function downloadZip() {
            var zip = new JSZip();
            zip.file('Fuskr.txt', 'These images were downloaded using Fuskr.\r\n\r\nFusk URL: ' + $rootScope.originalUrl);

            var validImages = $scope.images.filter(function (x) {
                        return x.loaded && x.success;
                    });

            validImages.forEach(function (img) {
                zip.file(img.url.split('/').pop(), img.data, { blob: true });
            });

            zip.generateAsync({ type: 'blob' })
            .then(function (content) {
                saveAs(content, 'fuskr.zip');
            });
        }
    });
}());
