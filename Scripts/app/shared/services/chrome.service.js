/* globals chrome */

(function () {
    'use strict';

    angular
        .module('fuskrApp')
        .factory('chromeService', ChromeService);

    function ChromeService() {
        return {
            getMessage: getMessage
        };

        function getMessage(name) {
            return chrome.i18n.getMessage(name);
        }
    }
}());
