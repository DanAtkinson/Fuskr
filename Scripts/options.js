/* globals document, chrome, clearTimeout, setTimeout */

(function () {
	'use strict';

	var timeoutId = null,
		options = {
			history: [],
			darkMode: false,
			keepRecentFusks: true,
			openInForeground: true
		};

	function setCheckboxes() {
		var darkMode = document.getElementById('darkMode');
		var keepRecentFusks = document.getElementById('keepRecentFusks');
		var openInForeground = document.getElementById('openInForeground');

		if (darkMode && keepRecentFusks && openInForeground) {
			darkMode.checked = options.darkMode;
			keepRecentFusks.checked = options.keepRecentFusks;
			openInForeground.checked = options.openInForeground;
		}
	}

	function saveOptions() {
		var darkMode = document.getElementById('darkMode');
		var keepRecentFusks = document.getElementById('keepRecentFusks');
		var openInForeground = document.getElementById('openInForeground');
		var status = document.getElementById('status');

		var optionsToSet = {
			darkMode: darkMode.checked,
			keepRecentFusks: keepRecentFusks.checked,
			openInForeground: openInForeground.checked
		};

		// If disabling recent fusks, clear history
		if (!keepRecentFusks.checked) {
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

	(function () {
		document.addEventListener('DOMContentLoaded', setCheckboxes);
		document.getElementById('save').addEventListener('click', saveOptions);

		var storagePromise = new Promise(function (resolve) {
			chrome.storage.sync.get(null, function (items) {
				if (typeof items === 'undefined') {
					//We cannot get or set options.
					return;
				}
				resolve(items);
			});
		});

		storagePromise.then(function(items) {
			Object.keys(items).map(function (key) {
				options[key] = items[key];
			});

			setCheckboxes();
		});
	}());

	chrome.storage.onChanged.addListener(function (changes) {
		if (changes === null || typeof changes === 'undefined') {
			return;
		}

		Object.keys(changes).map(function (key) {
			options[key] = changes[key].newValue;
		});

		setCheckboxes();
	});
}());
