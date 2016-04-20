(function() {
	var i = 0,
		ids = [],
		recentId = 0,
		parentId = -1,
		savedIds = [],
		historyIds = [],
		targetUrls,
		numbers = [l18nify("ContextMenu_10"), l18nify("ContextMenu_20"), l18nify("ContextMenu_50"), l18nify("ContextMenu_100"), l18nify("ContextMenu_200"), l18nify("ContextMenu_500"), l18nify("ContextMenu_Other")];

	//Target urls tell Chrome what urls are acceptable.
	targetUrls = (function() {
		var targetUrls = [];
		//Create regex patterns to match only urls that contain numbers
		for (var i = 0; i <= 9; i++) {
			targetUrls.push('*://*/*' + i + '*');
		}
		return targetUrls;
	})();

	(function () {
		var incDecMenuId, incMenuId, decMenuId, numbers = [l18nify("ContextMenu_10"), l18nify("ContextMenu_20"), l18nify("ContextMenu_50"), l18nify("ContextMenu_100"), l18nify("ContextMenu_200"), l18nify("ContextMenu_500"), l18nify("ContextMenu_Other")];

		//First, empty all the context menus for this extension.
		chrome.contextMenus.removeAll();


		for (i = 0; i < numbers.length; i++) {
		}


		// This event is fired each time the user updates the text in the omnibox, as long as the extension's keyword mode is still active.
		/*chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
			console.log('inputChanged: ' + text);
			suggest([
				{content: text + " one", description: "the first one"},
				{content: text + " number two", description: "the second entry"}
			]);
		});*/

		// This event is fired with the user accepts the input in the omnibox.
		chrome.omnibox.onInputEntered.addListener(function(text) {
			chrome.tabs.getSelected(null, function(tab){
				createTab(text, tab);
			});
		});

		if(getRecentFusksOption()) {
			createRecentMenu();
		}

		/*
		if(getSavedFusksOption()) {
			createSavedFusksMenu();
		}
		*/
	} ());

	function l18nify (name) {
		return chrome.i18n.getMessage("Application_" + name);
	}

	function createRecentMenu () {
		var history, historyArray, historyCount, historyId;

		if(recentId != 0) {
			chrome.contextMenus.remove(recentId);
			recentId = 0;
		}

		//Get the history
		history = localStorage.getItem("history");
		historyArray = [];
		historyIds = [];

		if(history == null) {
			return false;
		}


		//Split out the history into an array
		historyArray = history.split("||");
		historyCount = historyArray.length > 10 ? 10 : historyArray.length;

		for (i = 0; i < historyCount; i++) {
			if (historyArray[i] !== "") {
				//Add the menu
				historyIds.push([historyId, historyArray[i]]);
			}
		}

		if (historyArray.length > 0) {
		}
	}

	function createSavedFusksMenu () {
		var savedFusksOption, savedId;

		savedFusksOption = localStorage.getItem("savedFusks");

		if(savedFusksOption != null) {
			savedFusksOption = JSON.parse(savedFusksOption);
			if (savedFusksOption.length) {

				for (i = 0; i < savedFusksOption.length; i++) {
					savedIds.push(savedId, savedFusksOption[i]);
				}
			}
		}
	}

	function clearRecentOnClick () {
		localStorage.removeItem("history");
		createRecentMenu();
	}

	function optionsOnClick (info, tab) {
		chrome.tabs.create({ url:"/Html/options.htm", index: (tab.index + 1) });
	}

	function helpOnClick (info, tab) {
		chrome.tabs.create({ url:"/Html/help.htm", index: (tab.index + 1)});
	}

	function manualOnClick (info, tab) {
		var imageUrl, manualCheck, alphabetCheck, url;
		imageUrl = info.linkUrl != null ? info.linkUrl : info.srcUrl;
		manualCheck = /\[\d+-\d+\]/;
		alphabetCheck = /\[\w-\w\]/;
		url = prompt(l18nify("Prompt_PleaseEnterTheUrl"), imageUrl);

		if(url) {
			if(manualCheck.exec(url) == null && alphabetCheck.exec(url) == null) {
				alert(l18nify("Prompt_NotAValidFusk"));
				return false;
			}

			createTab(url, tab);
		}
	}

	function createFromSelectionOnClick (info, tab) {
		var url, manualCheck;
		url = info.selectionText;
		manualCheck = /\[\d+-\d+\]/;

		if(manualCheck.exec(url) == null) {
			alert(l18nify("Prompt_NotAValidFusk"));
			return false;
		}

		createTab(url, tab);
	}

	function recentOnClick (info, tab) {
		for(i = 0; i < historyIds.length; i++) {
			if(historyIds[i][0] == info.menuItemId) {
				createTab(historyIds[i][1], tab);
				break;
			}
		}
	}

	function savedOnClick (info, tab) {
		for(i = 0; i < savedIds.length; i++) {
			if(savedIds[i][0] == info.menuItemId) {
				createTab(savedIds[i][1].url, tab);
				break;
			}
		}
	}

	function createTab (url, tab) {
		addUrlToLocalStorage(url, tab);

		chrome.tabs.create({ windowId: tab.windowId, url:"/Html/images.htm#/fusk/" + url, index: (tab.index + 1), selected: getOpenInForeground() });
	}

	function addUrlToLocalStorage (url, tab) {
		var history, historyArray, tempHistory;

		if(tab.incognito || getRecentFusksOption() == false) {
			//As a rule, do not store incognito data in localstorage.
			return false;
		}

		//Get the history
		history = localStorage.getItem("history");
		historyArray = [];

		historyArray.push(url);

		if(history != null) {
			//Push the rest of the urls onto the pile onto the array
			tempHistory = history.split("||");
			for(i = 0; i < tempHistory.length; i++) {
				historyArray.push(tempHistory[i]);
			}
		}

		while(historyArray.length > 100) {
			//Ensure that we only maintain a list of 100 recent items
			historyArray.pop();
		}

		//Save the urls
		localStorage.setItem("history", historyArray.join("||"));

		//now need to reset the 'Recent' context menus and add them again.
		if(getRecentFusksOption()) {
			createRecentMenu();
		}
	}

	function getRecentFusksOption () {
		var keepRecentFusksVal = localStorage.getItem("keepRecentFusks");

		if(keepRecentFusksVal == null) {
			return true;
		}

		var keepRecentFusks = parseInt(keepRecentFusksVal, 10);

		if (keepRecentFusks !== 0 && keepRecentFusks !== 1) {
			//Populate the local storage with the default value.
			localStorage.setItem("keepRecentFusks", 1);
		}

		return keepRecentFusks != 0;
	}

	function getSavedFusksOption () {
		var savedFusksOption;

		savedFusksOption = localStorage.getItem("savedFusks");
		if(savedFusksOption == null || savedFusksOption === '\"[]\"') {
			localStorage.setItem("savedFusks", JSON.stringify("[]"));
			return false;
		}

		return true;
	}

	function getOpenInForeground () {
		var openInForegroundVal, openInForeground;

		openInForegroundVal = localStorage.getItem("openInForeground");

		if(openInForegroundVal == null) {
			return true;
		}

		openInForeground = parseInt(openInForegroundVal, 10);

		if (openInForeground !== 0 && openInForeground !== 1) {
			//Populate the local storage with the default value.
			localStorage.setItem("openInForeground", 1);
		}

		return openInForeground != 0;
	}

	function choiceOnClick(info, tab) {
		var count = 0, direction = 0, imageUrl = "", response = "", findDigitsRegexp, digitsCheck;
		findDigitsRegexp = /^(.*?)(\d+)([^\d]*)$/;

		if (info.linkUrl !== null) {
			digitsCheck = findDigitsRegexp.exec(info.linkUrl);
			if (digitsCheck !== null) {
				imageUrl = info.linkUrl;
			}
		}
		if (digitsCheck === null && info.srcUrl !== null) {
			digitsCheck = findDigitsRegexp.exec(info.srcUrl);
			if (digitsCheck !== null) {
				imageUrl = info.srcUrl;
			}
		}

		if (imageUrl === "") {
			alert(l18nify("Prompt_NotAValidFusk"));
			return;
		}

		for(i = 0; i < ids.length; i++) {
			if(ids[i][0] == info.menuItemId) {

				direction = parseInt(ids[i][1], 10);

				if(ids[i][2] == l18nify("ContextMenu_Other")) {
					response = prompt(l18nify("Prompt_HowMany"));

					if(parseInt(response, 10) == false) {
						alert(l18nify("Prompt_NotAValidNumber"));
						break;
					}
					count = parseInt(response, 10);
				} else {
					count = parseInt(ids[i][2], 10);
				}
				url = createUrl(imageUrl, count, direction, digitsCheck);

				createTab(url, tab);
				break;
			}
		}
	}

	function createUrl(currentUrl, count, direction, digitsCheck) {
		var begin, number, end, firstNum, lastNum;

		begin = digitsCheck[1];
		number = digitsCheck[2];
		end = digitsCheck[3];

		firstNum = parseInt(number, 10);
		lastNum = firstNum;

		if(direction == 0) {
			firstNum -= count;
			lastNum += count;
		} else if(direction == -1) {
			firstNum -= count;
		} else if(direction == 1) {
			lastNum += count;
		}

		firstNum = (firstNum < 0 ? 0 : firstNum).toString();
		lastNum = (lastNum < 0 ? 0 : lastNum).toString();

		while(firstNum.length < number.length) {
			firstNum = "0" + firstNum;
		}

		while(lastNum.length < firstNum.length) {
			lastNum = "0" + lastNum;
		}

		return begin + "[" + firstNum + "-" + lastNum + "]" + end;
	}

		return chrome.contextMenus.create({ parentId: obj.Id, title: obj.Title, contexts: obj.Context || ["all"], type: obj.ItemType || "normal", onclick: obj.OnclickCallback || null, targetUrlPatterns: obj.TargetUrlPatterns || null });
	};
} ());
