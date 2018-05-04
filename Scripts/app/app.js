/* globals angular */

(function () {
    'use strict';

    angular
        .module('fuskrApp', ['ngSanitize'])
        .run(['$rootScope', '$filter', function ($rootScope, $filter) {
            $rootScope.manifestName = $filter('translate')('ManifestName', '');
            $rootScope.manifestLanguage = $filter('translate')('ManifestLanguage', '');
        }]);

}());
