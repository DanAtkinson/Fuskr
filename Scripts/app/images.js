/*globals angular, Fuskr, chrome, saveToStorage, JSZip, saveAs */
(function () {
    'use strict';

    var app = angular.module('fuskrApp');

    app.config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('main', {
                url: '/fusk/{path:.*}',
                templateUrl: '/Html/partials/imagelist.html',
                controller: 'ImageListController',
                onEnter: function ($rootScope, $stateParams) {
                    $rootScope.pageTitle = $stateParams.path.replace(/(https*:)*\/\/(www\.)*/i, '');
                    $rootScope.originalUrl = $stateParams.path;
                },
                resolve: {
                    images: function (fuskrService, $stateParams) {
                        return fuskrService.getLinks($stateParams.path);
                    }
                }
            });
    });

    app.controller('ImageDownloadController', function ($scope, images, helpers) {
        $scope.conflictResolution = helpers.getStorage('conflictResolution', 'uniquify');
        $scope.downloadAll = function () {
            saveToStorage('conflictResolution', $scope.conflictResolution);

            images.forEach(function (image) {
                chrome.downloads.download({
                    url: image.url,
                    conflictAction: $scope.conflictResolution
                });
            });

            $scope.$close();
        };

        // TODO: Replace this with a directive to auto-save to storage
        function saveToStorage(name, value) {
            if (typeof value === 'boolean') {
                value = value ? 1 : 0;
            }
            helpers.setStorage(name, value);
        }
    });

    app.controller('ImageListController', function ($document, $rootScope, $scope, helpers, images, Popeye) {

        // An array of image objects
        $scope.images = images;
        $scope.filteredImages = images;
        $scope.selectedImageId = 0;

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
        $scope.pluraliseForImages = function (key) {
            return {
                '0': helpers.translate(key),
                'one': helpers.translate(key),
                'other': helpers.translate(key)
            };
        };
        $scope.shouldDisplayImage = function () {
            return function (img) {
                return !img.loaded || img.success || $scope.showBrokenImages;
            };
        };
        $scope.scrollToAnchor = function (htmlElementId, itemId) {
            if (itemId < 0 || !itemId) {
                itemId = 0;
            }
            if (itemId > $scope.filteredImages.length - 1) {
                itemId = $scope.filteredImages.length - 1;
            }

            $scope.selectedImageId = itemId;

            if (htmlElementId) {
                helpers.scrollTo(htmlElementId);
            }
        };
        $scope.download = function () {

            var modal, validImages;

            validImages = $scope.images.filter(function (x) {
                return x.loaded && x.success;
            });

            modal = Popeye.openModal({
                templateUrl: '/Html/partials/download.html',
                controller: 'ImageDownloadController',
                resolve: {
                    images: function ($http) {
                        return validImages;
                    }
                }
            });
        };
        $scope.downloadZip = function () {
            var zip, validImages;

            zip = new JSZip();
            zip.file('Fuskr.txt', 'These images were downloaded using Fuskr.\r\n\r\nFusk URL: ' + $rootScope.originalUrl);

            validImages = $scope.images.filter(function (x) {
                return x.loaded && x.success;
            });

            validImages.forEach(function (img) {
                zip.file(img.url.split('/').pop(), img.data, { blob: true });
            });

            zip.generateAsync({ type: 'blob' }).then(function (content) {
                saveAs(content, 'fuskr.zip');
            });
        };

        $document.bind('keydown', function (e) {
            switch (e.which) {
            case 37:
                /* Left */
                e.preventDefault();
                $scope.$apply(function () {
                    $scope.scrollToAnchor(false ? null : 'image' + ($scope.selectedImageId - 1), $scope.selectedImageId - 1);
                });
                break;
            case 39:
                /* Right */
                e.preventDefault();
                $scope.$apply(function () {
                    $scope.scrollToAnchor(false ? null : 'image' + ($scope.selectedImageId + 1), $scope.selectedImageId + 1);
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
        });
    });
}());
