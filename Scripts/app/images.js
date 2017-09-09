/* globals JSZip, saveAs */

(function () {

    var app = angular.module('fuskrApp');
    var originalUrl = '';

    app.controller('ImageListController', function ($document, $rootScope, $scope, $location, $filter, anchorScrollService, fuskrService) {

        var url = $location.hash();
        var images = fuskrService.getLinks(url);

        // An array of image objects
        $scope.images = images;
        $scope.filteredImages = images;
        $scope.selectedImageId = 0;
        $scope.originalUrl = url;
        originalUrl = url;

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
            zip.file('Fuskr.txt', 'These images were downloaded using Fuskr.\r\n\r\nFusk URL: ' + originalUrl);

            var validImages = $scope.images.filter(function (x) {
                        return x.loaded && x.success;
                    });

            // Split each URL into path components
            var explodedPaths = validImages.map(function (x) {
                return {
                    data: x.data,
                    url: x.url.split('/').map(safeFileName)
                };
            });

            // Check that all URL components at an index
            // are the same, to determine the root folder
            function checkIfAllItemsAtIndexEqual(x) {
                var pass = explodedPaths.map(function (r) {
                    return r.url.length > x ?
                        r.url[index]
                        : null;
                });

                var allSame = pass.every(function (r) {
                    return r == pass[0];
                });

                return allSame;
            }

            var index = 0;
            for (index = 0; index < validImages.length; index++) {
                if (checkIfAllItemsAtIndexEqual(index) === false) {
                    break;
                }
            }

            // Trim the URL up until the common folder
            var shortenedPathImages = explodedPaths.map(function (r) {
                return {
                    data: r.data,
                    url: r.url.slice(index).join('/')
                };
            });

            function addExtensionIfNeeded(filename, blobData) {
                var types = {
                    'image/gif': ['gif'],
                    'image/jpeg': ['jpeg', 'jpg'],
                    'image/png': ['png'],
                    'image/tiff': ['tif', 'tiff'],
                    'image/vnd.wap.wbmp': ['wbmp'],
                    'image/x-icon': ['ico'],
                    'image/x-jng': ['jng'],
                    'image/x-ms-bmp': ['bmp'],
                    'image/svg+xml': ['svg'],
                    'image/webp': ['webp']
                };

                // Get expected extension
                var expected = types[blobData.type];
                if (expected) {
                    // Iterate through expected types
                    // to check if it matches any on the list
                    var hasMatch = expected.some(function (x) {
                        return filename.match(new RegExp('\\.' + x + '$'));
                    });

                    if (!hasMatch) {
                        // If no extension matches, add one
                        return filename + '.' + expected[0];
                    }
                }

                // If an acceptable extension or no known
                // mimetype, just return
                return filename;
            }

            function safeFileName(str) {
                return str.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
            }

            // Add an extension for known file types and remove any trailing slash
            shortenedPathImages.forEach(function (img) {
                var fileName = addExtensionIfNeeded(img.url.replace(/\/$/, ''), img.data);
                zip.file(fileName, img.data, { blob: true });
            });

            zip.generateAsync({ type: 'blob' })
            .then(function (content) {
                saveAs(content, 'fuskr.zip');
            });
        }
    });
}());
