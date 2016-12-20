/* globals Fuskr, URL */

(function () {
    'use strict';

    angular
        .module('fuskrApp')
        .factory('fuskrService', FuskrService);

    FuskrService.$inject = ['$http'];

    function FuskrService($http) {

        return {
            getLinks: getLinks
        };

        function getLinks(url) {
            var fuskLinks = Fuskr.GetLinks(url);

            var mappedLinks = [];

            mappedLinks.originalUrl = url;
            mappedLinks.totalLoaded = 0;
            mappedLinks.totalSuccess = 0;
            mappedLinks.totalFailed = 0;
            mappedLinks.finishedLoading = false;

            fuskLinks.forEach(function (url, i) {
                var imageItem =  {
                    url: url,
                    loaded: false,
                    success: false,
                    active: (i === 0),
                    src: null
                };

                $http({
                    url: imageItem.url,
                    responseType: 'blob',
                    method: 'GET',
                })
                .then(function (response) {
                    imageItem.success = (response.status >= 200 && response.status < 400);
                    imageItem.loaded = true;
                    imageItem.src = (response.data) ? URL.createObjectURL(response.data) : null;
                    imageItem.data = response.data;

                    mappedLinks.totalLoaded = mappedLinks.totalLoaded + 1;
                    mappedLinks.totalSuccess = mappedLinks.totalSuccess + 1;
                    mappedLinks.finishedLoading = mappedLinks.totalLoaded === fuskLinks.length;
                }, function () {
                    imageItem.success = false;
                    imageItem.loaded = true;

                    mappedLinks.totalLoaded = mappedLinks.totalLoaded + 1;
                    mappedLinks.totalFailed = mappedLinks.totalFailed + 1;
                    mappedLinks.finishedLoading = mappedLinks.totalLoaded === fuskLinks.length;
                });

                mappedLinks.push(imageItem);
            });

            return mappedLinks;
        }
    }
}());
