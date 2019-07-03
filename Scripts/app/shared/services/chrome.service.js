/* globals chrome, angular */

(function () {
    'use strict';

    angular
        .module('fuskrApp')
        .factory('chromeService', ChromeService);

    function ChromeService() {
        return {
            getMessage: getMessage,
            getDarkMode: getDarkMode
        };

        function getMessage(name) {
            return chrome.i18n.getMessage(name);
        }

        function getDarkMode () {
            var darkModePromise = new Promise(function (resolve, reject) {
                var result = false;
                try {
                    chrome.storage.sync.get(['darkMode'], function (response) {
                        if (typeof response !== 'undefined' && response.hasOwnProperty('darkMode')) {
                            result = JSON.parse(response.darkMode.toString().toLowerCase());
                            resolve(result);
                        }
                    });
                } catch (err) {
                    reject(err);
                }
            });

            return darkModePromise;
        }
    }
}());
