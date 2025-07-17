/* globals chrome, alert, prompt, Fuskr */
(function () {

	var i = 0,
		recentId = 0,
		parentId = -1,
		historyIds = [],
		targetUrls = (function () {
			var targetUrls = [];
			//Target urls tell Chrome what urls are acceptable.
			//Create regex patterns to match only urls that contain numbers
			for (var i = 0; i <= 9; i++) {
				targetUrls.push('*://*/*' + i + '*');
			}
			return targetUrls;
		}()),
		options = {
			darkMode: false,
			keepFusks: true,
			openInForeground: true,
			history: [],
		};

	function l18nify(name) {
		return chrome.i18n.getMessage('Application_' + name);
	}

	function createRecentMenu(historyArray) {
		var historyId;

		if (recentId !== 0) {
			chrome.contextMenus.remove(recentId);
			recentId = 0;
		}

		historyIds = [];

		if (historyArray === null || historyArray.length === 0) {
			return false;
		}

		recentId = createContextMenu({ Id: 'FuskrRecent', ParentId: 'FuskrContextMenu', Title: l18nify('ContextMenu_Recent') });

		for (i = 0; i < historyArray.length; i++) {
			if (historyArray[i] !== '') {
				//Add the menu
				historyId = createContextMenu({ Id: ('FuskrHistory_' + i),	ParentId: recentId, Title: historyArray[i] });
				historyIds.push([historyId, historyArray[i]]);
			}
		}

		if (historyArray.length > 0) {
			createContextMenu({ Id: 'FuskrSeparator3', ParentId: recentId, ItemType: 'separator' });
			createContextMenu({ Id: 'FuskrClearHistory', ParentId: recentId, Title: l18nify('ContextMenu_ClearRecentActivity') });
		}
	}

	function clearRecentOnClick() {
		createRecentMenu([]);
	}

	function optionsOnClick() {
		chrome.runtime.openOptionsPage();
	}

	function manualOnClick(info, tab) {
		var imageUrl, manualCheck, alphabetCheck, url;
		imageUrl = info.linkUrl !== null ? info.linkUrl : info.srcUrl;
		manualCheck = /\[\d+-\d+\]/;
		alphabetCheck = /\[\w-\w\]/;
		url = prompt(l18nify('Prompt_PleaseEnterTheUrl'), imageUrl);

		if (url) {
			if (manualCheck.exec(url) === null && alphabetCheck.exec(url) === null) {
				alert(l18nify('Prompt_NotAValidFusk'));
				return false;
			}

			createTab(url, tab);
		}
	}

	/*
	function infiniteOnClick(info, tab) {
		var url = '',
			digitsCheck,
			findDigitsRegexp = /^(.*?)(\d+)([^\d]*)$/;

		if (info.linkUrl !== null) {
			digitsCheck = findDigitsRegexp.exec(info.linkUrl);
			if (digitsCheck !== null) {
				url = info.linkUrl;
			}
		}

		if (url === '' && info.srcUrl !== null) {
			digitsCheck = findDigitsRegexp.exec(info.srcUrl);
			if (digitsCheck !== null) {
				url = info.srcUrl;
			}
		}

		if (url === null || typeof url === 'undefined' || url === '') {
			alert(l18nify('Prompt_NotAValidFusk'));
			return;
		}

		if (digitsCheck && digitsCheck.length === 4) {
			//Should turn something like https://example.com/images/01/01.jpg into https://example.com/images/01/[01-01].jpg
			//Then we need to perform a check to see whether the fusk url creates a single element array.
			url = digitsCheck[1] + '[' + digitsCheck[2] + '-' + digitsCheck[2] + ']' + digitsCheck[3];
			createTab(url, tab);
		}
	}
	*/

	function createFromSelectionOnClick(info, tab) {
		var url, manualCheck;
		url = info.selectionText;
		manualCheck = /\[\d+-\d+\]/;

		if (manualCheck.exec(url) === null) {
			alert(l18nify('Prompt_NotAValidFusk'));
			return false;
		}

		createTab(url, tab);
	}

	function recentOnClick(info, tab) {
		var historyIndex = info.menuItemId.match(/^FuskrHistory_(\d+)$/);
		if (!historyIds.length || historyIndex === null || historyIndex.length !== 2) {
			alert(l18nify('Prompt_NotAValidFusk'));
			return;
		}

		historyIndex = parseInt(historyIndex[1], 10);
		if (isNaN(historyIndex) || historyIndex < 0) {
			alert(l18nify('Prompt_NotAValidFusk'));
			return;
		}

		if (historyIds.length <= historyIndex) {
			alert(l18nify('Prompt_NotAValidFusk'));
			return;
		}

		createTab(historyIds[historyIndex][1], tab);
	}

	function createTab(url, tab) {
		if (typeof url === 'undefined' || url === null || url.length === 0) {
			return;
		}

		addUrlToHistory(url, tab);

		chrome.tabs.create({
			windowId: tab.windowId,
			url: '/Html/images.htm#' + url,
			index: (tab.index + 1),
			active: options.openInForeground
		});
	}

	function addUrlToHistory(url, tab) {
		var newHistory = [];

		if (tab.incognito || options.keepRecentFusks === false) {
			//As a rule, do not store incognito data in history.
			return false;
		}

		// Add the url to the history
		newHistory = options.history.slice();
		newHistory.push(url);

		// Trim to the recent 10
		newHistory.slice(-10);

		chrome.storage.sync.set({
			history: newHistory
		}, null);

		//now need to reset the 'Recent' context menus and add them again.
		if (options.keepRecentFusks) {
			createRecentMenu(newHistory);
		}
	}

	function choiceOnClick(info, tab) {
		var count = 0,
			direction = 0,
			response = '',
			url = '',
			digitsCheck,
			menuItemInfo,
			findDigitsRegexp = /^(.*?)(\d+)([^\d]*)$/,
			menuItemRegexp = /^Fuskr_IncDec_(10|20|50|100|200|500|Other)_(NegOne|Zero|One)$/;

		if (info.linkUrl !== null) {
			digitsCheck = findDigitsRegexp.exec(info.linkUrl);
			if (digitsCheck !== null) {
				url = info.linkUrl;
			}
		}

		if (url === '' && info.srcUrl !== null) {
			digitsCheck = findDigitsRegexp.exec(info.srcUrl);
			if (digitsCheck !== null) {
				url = info.srcUrl;
			}
		}

		if (url === null || typeof url === 'undefined' || url === '') {
			alert(l18nify('Prompt_NotAValidFusk'));
			return;
		}

		menuItemInfo = info.menuItemId.match(menuItemRegexp);

		if (menuItemInfo === null || menuItemInfo.length !== 3) {
			alert(l18nify('Prompt_NotAValidFusk'));
			return;
		}

		if (menuItemInfo[1] === l18nify('ContextMenu_Other')) {
			response = prompt(l18nify('Prompt_HowMany'));

			if (isNaN(response) === true) {
				alert(l18nify('Prompt_NotAValidNumber'));
				return;
			}
			count = parseInt(response, 10);
		} else {
			count = parseInt(menuItemInfo[1], 10);
		}

		switch (menuItemInfo[2]) {
			case 'One':
				direction = 1;
				break;
			case 'Zero':
				direction = 0;
				break;
			case 'NegOne':
				direction = -1;
				break;
		}

		var fuskUrl = Fuskr.CreateFuskUrl(url, count, direction);
		createTab(fuskUrl, tab);
	}

	function createContextMenu(obj) {
		//Generate a new context menu item with a dynamically generated guid.
		var contextMenuId = chrome.contextMenus.create({
			parentId: obj.ParentId,
			title: obj.Title,
			contexts: obj.Context || ['all'],
			type: obj.ItemType || 'normal',
			targetUrlPatterns: obj.TargetUrlPatterns || null,
			id: obj.Id
		});

		return contextMenuId;
	}

	function createContextMenus() {
		var incDecMenuId, incMenuId, decMenuId, numbers, i;

		//First, empty all the context menus for this extension.
		chrome.contextMenus.removeAll();

		parentId = createContextMenu({ Id: 'FuskrContextMenu', Title: l18nify('ContextMenu_Fusk'), Context: ['all'] });
		incDecMenuId = createContextMenu({ Id: 'FuskrIncrementDecrement', ParentId: parentId, Title: '+/-', Context: ['image', 'video', 'audio', 'link'], TargetUrlPatterns: targetUrls });
		incMenuId = createContextMenu({ Id: 'FuskrIncrement', ParentId: parentId, Title: '+', Context: ['image', 'video', 'audio', 'link'], TargetUrlPatterns: targetUrls });
		decMenuId = createContextMenu({ Id: 'FuskrDecrement', ParentId: parentId, Title: '-', Context: ['image', 'video', 'audio', 'link'], TargetUrlPatterns: targetUrls });

		numbers = [l18nify('ContextMenu_10'), l18nify('ContextMenu_20'), l18nify('ContextMenu_50'), l18nify('ContextMenu_100'), l18nify('ContextMenu_200'), l18nify('ContextMenu_500'), l18nify('ContextMenu_Other')];
		for (i = 0; i < numbers.length; i++) {
			createContextMenu({ Id: 'Fuskr_IncDec_' + numbers[i] + '_Zero', ParentId: incDecMenuId, Title: numbers[i], Context: ['image', 'video', 'audio', 'link'] });
			createContextMenu({ Id: 'Fuskr_IncDec_' + numbers[i] + '_One', ParentId: incMenuId, Title: numbers[i], Context: ['image', 'video', 'audio', 'link']	});
			createContextMenu({ Id: 'Fuskr_IncDec_' + numbers[i] + '_NegOne', ParentId: decMenuId, Title: numbers[i], Context: ['image', 'video', 'audio', 'link'] });
		}

		createContextMenu({ Id: 'FuskrSeparator1', ParentId: parentId, Context: ['image', 'video', 'audio', 'link'], ItemType: 'separator' });
		createContextMenu({ Id: 'FuskrCreateFromSelection', ParentId: parentId, Title: l18nify('ContextMenu_CreateFromSelection'), Context: ['selection'] });
		createContextMenu({ Id: 'FuskrManual', ParentId: parentId, Title: l18nify('ContextMenu_Manual') });
		//createContextMenu({ Id: 'FuskrInfinite', ParentId: parentId, Title: l18nify('ContextMenu_Infinite') });
		createContextMenu({ Id: 'FuskrSeparator2', ParentId: parentId, ItemType: 'separator' });

		createContextMenu({ Id: 'FuskrOptions', ParentId: parentId, Title: l18nify('ContextMenu_Options') });
	}

	chrome.runtime.onInstalled.addListener(function (details) {
		if (details.reason === 'install') {
			// First install - set defaults
			chrome.storage.sync.set({
				history: [],
				darkMode: false,
				keepRecentFusks: true,
				openInForeground: true
			});
		} else if (details.reason === 'update') {
			var previousDarkMode = localStorage.getItem('darkMode') || '0';
			var previousKeepFusks = localStorage.getItem('keepRecentFusks') || '1';
			var previousOpenInForeground = localStorage.getItem('openInForeground') || '1';
			var previousHistory = localStorage.getItem('history') || '';

			// Was previously stored as 0/1
			var darkModeBool = parseInt(previousDarkMode, 10) === 1;
			var keepFusksBool = parseInt(previousKeepFusks, 10) === 1;
			var openForegroundBool = parseInt(previousOpenInForeground, 10) === 1;

			// Was previously stored delimited by ||
			var historyArray = previousHistory.split('||').filter(function (x) {
				return x !== null && typeof x !== 'undefined' && x.length > 0;
			});

			localStorage.clear();

			chrome.storage.sync.set({
				history: historyArray,
				darkMode: darkModeBool,
				keepRecentFusks: keepFusksBool,
				openInForeground: openForegroundBool
			});
		}

		createContextMenus();
	});

	chrome.storage.onChanged.addListener(function (changes) {
		if (changes === null || typeof changes === 'undefined') {
			return;
		}

		Object.keys(changes).map(function (key) {
			options[key] = changes[key].newValue;
		});

		// Hide or show the 'Recent Items' menu
		if (changes.keepRecentFusks && changes.keepRecentFusks.newValue !== changes.keepRecentFusks.oldValue) {
			if (changes.keepRecentFusks === true) {
				createRecentMenu(options.history);
			} else {
				createRecentMenu(null);
			}
		}
	});

	// Fill the options
	chrome.storage.sync.get(null, function (items) {
		if (typeof items === 'undefined') {
			//We cannot get or set options.
			return;
		}

		Object.keys(items).map(function (key) {
			options[key] = items[key];
		});
	});

	chrome.contextMenus.onClicked.addListener(function (info, tab) {
		switch(info.menuItemId) {
			case 'FuskrContextMenu', 'FuskrIncrementDecrement', 'FuskrIncrement', 'FuskrDecrement', 'FuskrSeparator1', 'FuskrSeparator2', 'FuskrSeparator3', 'FuskrRecent', 'FuskrInfinite':
				return;
			case 'FuskrCreateFromSelection':
				createFromSelectionOnClick(info, tab);
				return;
			case 'FuskrManual':
				manualOnClick(info, tab);
				return;
			case 'FuskrClearHistory':
				clearRecentOnClick(info, tab);
				return;
			case 'FuskrOptions':
				optionsOnClick(info, tab);
				return;
		}

		if (info.menuItemId.includes('Fuskr_IncDec_')) {
			choiceOnClick(info, tab);
			return;
		}

		if (info.menuItemId.includes('FuskrHistory_')) {
			recentOnClick(info, tab);
			return;
		}
	});

	// This event is fired with the user accepts the input in the omnibox.
	chrome.omnibox.onInputEntered.addListener(function (text) {
		chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
			createTab(text, tab[0]);
		});
	});
}());
