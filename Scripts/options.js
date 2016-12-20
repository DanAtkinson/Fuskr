/* globals localStorage, document, chrome, clearTimeout, setTimeout */

(function () {
    'use strict';

    var hasLoadedFromLocalStorage = false;
    var timeoutId = null;

    function loadOptions() {
        var keepRecentFusks = document.getElementById('keepRecentFusks');
        var openInForeground = document.getElementById('openInForeground');

        keepRecentFusks.checked = localStorage.keepRecentFusks === '1';
        openInForeground.checked = localStorage.openInForeground === '1';
    }

    function saveOptions() {
        var keepRecentFusks = document.getElementById('keepRecentFusks');
        var openInForeground = document.getElementById('openInForeground');
        var status = document.getElementById('status');

        localStorage.keepRecentFusks = keepRecentFusks.checked ? '1' : '0';
        localStorage.openInForeground = openInForeground.checked ? '1' : '0';

        status.innerHTML = 'Options saved!';
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
            status.innerHTML = '';
        }, 2000);
    }

    document.addEventListener('DOMContentLoaded', loadOptions);
    document.getElementById('save').addEventListener('click', saveOptions);
}());
