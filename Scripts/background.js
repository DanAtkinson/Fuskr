(function() {
	var i = 0,
		ids = [],
		recentId = 0,
		parentId = -1,
		savedIds = [],
		historyIds = [],
		targetUrls,
		numbers = ["10", "20", "50", "100", "200", "500", "Other"];

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
		var incDecMenuId, incMenuId, decMenuId, numbers = ["10", "20", "50", "100", "200", "500", "Other"];

		//First, empty all the context menus for this extension.
		chrome.contextMenus.removeAll();

		parentId = createContextMenu(null, "Fusk", "all");
		incDecMenuId = createContextMenu(parentId, "+/-", "image", null, null, targetUrls);
		incMenuId = createContextMenu(parentId, "+", "image", null, null, targetUrls);
		decMenuId = createContextMenu(parentId, "-", "image", null, null, targetUrls);

		for(i = 0; i < numbers.length; i++) {
			ids.push([createContextMenu(incDecMenuId, numbers[i], "image", null, choiceOnClick), 0, numbers[i]]);
			ids.push([createContextMenu(incMenuId, numbers[i], "image", null, choiceOnClick), 1, numbers[i]]);
			ids.push([createContextMenu(decMenuId, numbers[i], "image", null, choiceOnClick), -1, numbers[i]]);
		}

		createContextMenu(parentId, null, "image", "separator");
		createContextMenu(parentId, "Create from selection", "selection", null, createFromSelectionOnClick);
		createContextMenu(parentId, "Manual", null, null, manualOnClick);
		createContextMenu(parentId, null, null, "separator");
		//createContextMenu(parentId, "Help", null, null, helpOnClick);
		createContextMenu(parentId, "Options", null, null, optionsOnClick);

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

		if(getSavedFusksOption()) {
			createSavedFusksMenu();
		}
	} ());

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

		recentId = createContextMenu(parentId, "Recent");

		//Split out the history into an array
		historyArray = history.split("||");
		historyCount = historyArray.length > 10 ? 10 : historyArray.length;

		for(i = 0; i < historyCount; i++) {
			//Add the menu
			historyId = createContextMenu(recentId, historyArray[i], null, null, recentOnClick);
			historyIds.push([historyId, historyArray[i]]);
		}

		if(historyArray.length > 0) {
			createContextMenu(recentId, null, null, "separator");
			createContextMenu(recentId, "Clear Recent Activity", null, null, clearRecentOnClick);
		}
	}

	function createSavedFusksMenu () {
		var savedFusksOption, savedId;

		savedFusksOption = localStorage.getItem("savedFusks");

		if(savedFusksOption != null) {
			savedFusksOption = JSON.parse(savedFusksOption);
			if (savedFusksOption.length) {
				recentId = createContextMenu(parentId, "Saved");

				for (i = 0; i < savedFusksOption.length; i++) {
					savedId = createContextMenu(recentId, savedFusksOption[i].name, "all", null, savedOnClick);
					savedIds.push(savedId, savedFusksOption[i]);
				}
			}
		}
		//'"[{"name":"Foo","url":"http://google.com"},{"name":"Bar","url":"http://bing.com"}]'
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
		url = prompt("Please enter the url", imageUrl);

		if(url) {
			if(manualCheck.exec(url) == null && alphabetCheck.exec(url) == null) {
				alert("This is not a valid fusk - http://example.com/[1-8].jpg");
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
			alert("This is not a valid fusk - http://example.com/[1-8].jpg");
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

		chrome.tabs.create({ windowId: tab.windowId, url:"/Html/images.htm?url=" + url, index: (tab.index + 1), selected: getOpenInForeground() });
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
		var count = 0, direction = 0, imageUrl = "", response = "";

		for(i = 0; i < ids.length; i++) {
			imageUrl = info.linkUrl != null ? info.linkUrl : info.srcUrl;

			if(ids[i][0] == info.menuItemId) {
				direction = parseInt(ids[i][1], 10);

				if(ids[i][2] == "Other") {
					response = prompt("How many?");

					if(parseInt(response, 10) == false) {
						alert("Not a valid number!");
						break;
					}
					count = parseInt(response, 10);
				} else {
					count = parseInt(ids[i][2], 10);
				}

				url = createUrl(imageUrl, count, direction);

				createTab(url, tab);
				break;
			}
		}
	}

	function createUrl(currentUrl, count, direction) {
		var findDigitsRegexp, digitsCheck, begin, number, end, firstNum, lastNum;

		findDigitsRegexp = /^(.*?)(\d+)([^\d]*)$/;
		digitsCheck = findDigitsRegexp.exec(currentUrl);

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

	function createContextMenu(id, title, context, itemType, onclickCallback, targetUrlPatterns) {
		return chrome.contextMenus.create({ parentId: id, title: title, contexts: [context || "all"], type: itemType || "normal", onclick: onclickCallback, targetUrlPatterns: targetUrlPatterns });
	}
})();
