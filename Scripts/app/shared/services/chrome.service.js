/* globals localStorage, chrome */

(function () {
    'use strict';

    angular
        .module('fuskrApp')
        .factory('chromeService', ChromeService);

    function ChromeService() {
        return {
            setStorage: setStorage,
            getStorage: getStorage,
            getMessage: getMessage
        };

        function setStorage(name, value) {
            localStorage.setItem(name, value);
        }

        function getStorage(name, defaultValue) {
            var value = localStorage.getItem(name);

            if ((typeof (value) === 'undefined' || value === null) && typeof (defaultValue) !== 'undefined') {
                value = defaultValue;
                setStorage(name, value);
            }

            return value;
        }

        function getMessage(name) {
            return chrome.i18n.getMessage(name);
        }
    }
}());
