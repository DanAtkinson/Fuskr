/* globals JSZip, saveAs */

(function () {
    'use strict';

    var originalUrl = '';
    var app = angular.module('fuskrApp');

    angular
        .module('fuskrApp')
        .controller('ImageListController', ['$document', '$rootScope', '$scope', '$location', '$filter', 'anchorScrollService', 'fuskrService', imageListController]);

    function imageListController($document, $rootScope, $scope, $location, $filter, anchorScrollService, fuskrService) {
        /* jshint validthis: true */

        var vm = this;

        //Functions
        vm.totalSuccess = totalSuccess;
        vm.totalFailed = totalFailed;
        vm.isFinishedLoading = isFinishedLoading;
        vm.scrollToAnchor = scrollToAnchor;
        vm.shouldDisplayImage = shouldDisplayImage;
        vm.pluraliseForImages = pluraliseForImages;
        vm.downloadZip = downloadZip;

        //Initialise
        (function () {
            var url, images;
            url = $location.hash();
            images = fuskrService.getLinks(url);
            vm.model = {
                images: images,
                filteredImages: images,
                originalUrl: url,
                showViewer: false,
                showBrokenImages: false,
                selectedImageId: 0,
                imageDisplay: 'imagesFitOnPage'
            };

            $document.bind('keydown', keyboardBinding);
        }());

        // Lambda functions
        function totalSuccess() {
            return vm.model.images.map(function (x) {
                return x.loaded && x.success ? 1 : 0;
            }).reduce(function (a, b) {
                return a + b;
            }, 0);
        }

        function totalFailed() {
            return vm.model.images.map(function (x) {
                return x.loaded && !x.success ? 1 : 0;
            }).reduce(function (a, b) {
                return a + b;
            }, 0);
        }

        function isFinishedLoading() {
            return vm.model.images.every(function (x) { return x.loaded; });
        }

        function scrollToAnchor($event, htmlElementId, itemId) {
            if (typeof $event.preventDefault !== 'undefined') {
                $event.preventDefault();
            }

            if (itemId < 0 || !itemId) {
                itemId = 0;
            }

            if (itemId > vm.model.filteredImages.length - 1) {
                itemId = vm.model.filteredImages.length - 1;
            }

            vm.model.selectedImageId = itemId;

            if (htmlElementId) {
                anchorScrollService.scrollTo(htmlElementId);
            }
        }

        function shouldDisplayImage() {
            return function (img) {
                return !img.loaded || img.success || vm.model.showBrokenImages;
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
                        scrollToAnchor(e, false ? null : 'image' + (vm.model.selectedImageId - 1), vm.model.selectedImageId - 1);
                    });
                break;
                case 39:
                    /* Right */
                    e.preventDefault();
                    $scope.$apply(function () {
                        scrollToAnchor(e, false ? null : 'image' + (vm.model.selectedImageId + 1), vm.model.selectedImageId + 1);
                    });
                break;
                case 27:
                    /* Escape */
                    e.preventDefault();
                    $scope.$apply(function () {
                        vm.model.showViewer = !vm.model.showViewer;
                    });
                break;
            }
        }

        function downloadZip() {
            var zip, validImages, explodedPaths, shortenedPathImages, imageUrlsForTxtFile = '', index = 0;

            validImages = vm.model.images.filter(function (x) {
                return x.loaded && x.success;
            });

            // Split each URL into path components
            explodedPaths = validImages.map(function (x) {
                return {
                    url: x.url,
                    data: x.data,
                    urlArray: x.url.split('/').map(safeFileName)
                };
            });

            // Check that all URL components at an index are the same, to determine the root folder
            function checkIfAllItemsAtIndexEqual(x) {
                var pass, allSame;
                pass = explodedPaths.map(function (r) {
                    return r.urlArray.length > x ? r.urlArray[index] : null;
                });

                allSame = pass.every(function (r) {
                    return r == pass[0];
                });

                return allSame;
            }

            for (index = 0; index < validImages.length; index++) {
                if (checkIfAllItemsAtIndexEqual(index) === false) {
                    break;
                }
            }

            // Trim the URL up until the common folder and add it to zip text file.
            shortenedPathImages = explodedPaths.map(function (r) {
                imageUrlsForTxtFile += r.url + '\r\n';
                return {
                    data: r.data,
                    url: r.urlArray.slice(index).join('/')
                };
            });

            function addExtensionIfNeeded(filename, blobData) {
                var expected, types;

                types = {
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
                expected = types[blobData.type];
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

            zip = new JSZip();
            zip.file('Fuskr.txt', 'These images were downloaded using Fuskr.\r\n\r\nFusk Url: ' + vm.model.originalUrl + '\r\n\r\n\r\nUrls:\r\n' + imageUrlsForTxtFile);

            // Add an extension for known file types and remove any trailing slash
            shortenedPathImages.forEach(function (img) {
                var fileName = addExtensionIfNeeded(img.url.replace(/\/$/, ''), img.data);
                zip.file(fileName, img.data, { blob: true });
            });

            zip.generateAsync({ type: 'blob' })
            .then(function (content) {
                var zipFilename = prompt('Please enter the name of the generated zip file to download.\nChoosing cancel will abort the zip file download.', 'fuskr.zip');

                if (zipFilename === '') {
                    //User has cancelled out.
                    return;
                }

                //Ensure correct extension.
                if (!zipFilename.toLowerCase().endsWith('.zip')) {
                    zipFilename += '.zip';
                }

                saveAs(content, zipFilename);
            });
        }

    }

}());
