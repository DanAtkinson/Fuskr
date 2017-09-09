/* globals document, chrome, clearTimeout, setTimeout */

(function () {
    'use strict';

    var timeoutId = null,
        options = {};

    function setCheckboxes() {
        var keepRecentFusks = document.getElementById('keepRecentFusks');
        var openInForeground = document.getElementById('openInForeground');

        if (keepRecentFusks && openInForeground) {
            keepRecentFusks.checked = options.keepRecentFusks;
            openInForeground.checked = options.openInForeground;
        }
    }

    function saveOptions() {
        var keepRecentFusks = document.getElementById('keepRecentFusks');
        var openInForeground = document.getElementById('openInForeground');
        var status = document.getElementById('status');

        var optionsToSet = {
            keepRecentFusks: keepRecentFusks.checked,
            openInForeground: openInForeground.checked
        };

        // If disabling recent fusks, clear history
        if (keepRecentFusks.checked === false) {
            optionsToSet.history = [];
        }

        chrome.storage.sync.set(optionsToSet, function () {
            if (chrome.runtime.lastError) {
                status.innerHTML = 'Could not save settings. Try again.';
            } else {
                status.innerHTML = 'Options saved!';
                clearTimeout(timeoutId);
                timeoutId = setTimeout(function () {
                    status.innerHTML = '';
                }, 2000);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', setCheckboxes);
    document.getElementById('save').addEventListener('click', saveOptions);

    chrome.storage.sync.get(null, function (items) {
        Object.keys(items).map(function (key) {
            options[key] = items[key];
        });

        setCheckboxes();
    });

    chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (changes === null || typeof changes === 'undefined') {
            return;
        }

        Object.keys(changes).map(function (key) {
            options[key] = changes[key].newValue;
        });

        setCheckboxes();
    });
}());
