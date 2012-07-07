(function() {
	var ids = [],
		recentId = 0,
		historyIds = [];

	//Target urls tell Chrome what urls are acceptable.
	var targetUrls = (function() {
		var targetUrls = [];
		//Create regex patterns to match only urls that contain numbers
		for (var i = 0; i <= 9; i++) {
			targetUrls.push('*://*/*' + i + '*');
		}
		return targetUrls;
	})();

	var parentId = chrome.contextMenus.create({ "title": "Fusk", "contexts": ["all"] });
	var incDecMenuId = chrome.contextMenus.create({ "title": "+/-", "parentId": parentId, "contexts": ["image"], "targetUrlPatterns": targetUrls });
	var incMenuId = chrome.contextMenus.create({ "title": "+", "parentId": parentId, "contexts": ["image"], "targetUrlPatterns": targetUrls });
	var decMenuId = chrome.contextMenus.create({ "title": "-", "parentId": parentId, "contexts": ["image"], "targetUrlPatterns": targetUrls });
	chrome.contextMenus.create({ "parentId": parentId, "contexts": ["image"], "type": "separator" });
	chrome.contextMenus.create({ "parentId": parentId, "title": "Create from selection", "contexts": ["selection"], /*"selectionPatterns": ["/\[\d+-\d+\]/"],*/ "onclick": createFromSelectionOnClick });
	chrome.contextMenus.create({ "title": "Manual", "parentId": parentId, "contexts": ["all"], "onclick": manualOnClick });
	chrome.contextMenus.create({ "parentId": parentId, "contexts": ["all"], "type": "separator" });
	chrome.contextMenus.create({ "title": "Options", "parentId": parentId, "contexts": ["all"], "onclick": optionsOnClick });

	if(getRecentFusksOption()) {
		createRecentMenu();
	}

	var numbers = ["10", "20", "50", "100", "200", "500", "Other"];
	for(var i = 0; i < numbers.length; i++) {
		ids.push([chrome.contextMenus.create({ "title": numbers[i], "parentId": incDecMenuId, "contexts": ["image"], "onclick": choiceOnClick }), 0, numbers[i]]);
		ids.push([chrome.contextMenus.create({ "title": numbers[i], "parentId": incMenuId, "contexts": ["image"], "onclick": choiceOnClick }), 1, numbers[i]]);
		ids.push([chrome.contextMenus.create({ "title": numbers[i], "parentId": decMenuId, "contexts": ["image"], "onclick": choiceOnClick }), -1, numbers[i]]);
	}

	function createRecentMenu() {
		if(recentId != 0) {
			chrome.contextMenus.remove(recentId);
			recentId = 0;
		}

		//Get the history
		var history = localStorage.getItem("history");
		var historyArray = [];
		historyIds = [];

		if(history == null) {
			return false;
		}

		recentId = chrome.contextMenus.create({ "title": "Recent", "parentId": parentId, "contexts": ["all"] });

		//Split out the history into an array
		historyArray = history.split("||");
		var historyCount = historyArray.length > 10 ? 10 : historyArray.length;

		for(var i = 0; i < historyCount; i++) {
			//Add the menu
			var historyId = chrome.contextMenus.create({ "title": historyArray[i], "parentId": recentId, "contexts": ["all"], "onclick": recentOnClick });
			historyIds.push([historyId, historyArray[i]]);
		}

		if(historyArray.length > 0) {
			chrome.contextMenus.create({ "parentId": recentId, "contexts": ["all"], "type": "separator" });
			chrome.contextMenus.create({ "title": "Clear Recent Activity", "parentId": recentId, "contexts": ["all"], "onclick": clearRecentOnClick });
		}
	}

	function clearRecentOnClick() {
		localStorage.removeItem("history");
		createRecentMenu();
	}

	function optionsOnClick(info, tab) {
		chrome.tabs.create({ url:"/Html/options.htm", index: (tab.index + 1) });
	}

	function manualOnClick(info, tab) {
		var imageUrl = info.linkUrl != null ? info.linkUrl : info.srcUrl;
		var manualCheck = /\[\d+-\d+\]/;
		var url = prompt("Please enter the url", imageUrl);

		if(url) {
			if(manualCheck.exec(url) == null) {
				alert("This is not a valid fusk - http://example.com/[1-8].jpg");
				return false;
			}

			createTab(url, tab);
		}
	}

	function createFromSelectionOnClick(info, tab) {
		var url = info.selectionText;
		var manualCheck = /\[\d+-\d+\]/;

		if(manualCheck.exec(url) == null) {
			alert("This is not a valid fusk - http://example.com/[1-8].jpg");
			return false;
		}

		createTab(url, tab);
	}

	function recentOnClick(info, tab) {
		for(var i = 0; i < historyIds.length; i++) {
			if(historyIds[i][0] == info.menuItemId) {
				createTab(historyIds[i][1], tab);
				break;
			}
		}
	}

	function createTab(url, tab) {
		addUrlToLocalStorage(url, tab);

		chrome.tabs.create({ windowId: tab.windowId, url:"/Html/images.htm?url=" + url, index: (tab.index + 1), selected: getOpenInForeground() });
	}

	function addUrlToLocalStorage(url, tab) {
		if(tab.incognito || getRecentFusksOption() == false) {
		//As a rule, do not store incognito data in localstorage.
			return false;
		}

		//Get the history
		var history = localStorage.getItem("history");
		var historyArray = [];

		historyArray.push(url);

		if(history != null) {
			//Push the rest of the urls onto the pile onto the array
			var tempHistory = history.split("||");
			for(var i = 0; i < tempHistory.length; i++) {
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

	function getRecentFusksOption() {
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

	function getOpenInForeground() {
		var openInForegroundVal = localStorage.getItem("openInForeground");

		if(openInForegroundVal == null) {
			return true;
		}

		var openInForeground = parseInt(openInForegroundVal, 10);

		if (openInForeground !== 0 && openInForeground !== 1) {
			//Populate the local storage with the default value.
			localStorage.setItem("openInForeground", 1);
		}

		return openInForeground != 0;
	}

	function choiceOnClick(info, tab) {
		var count = 0;
		var direction = 0;

		for(var i = 0; i < ids.length; i++) {
			var imageUrl = info.linkUrl != null ? info.linkUrl : info.srcUrl;

			if(ids[i][0] == info.menuItemId) {
				direction = parseInt(ids[i][1], 10);

				if(ids[i][2] == "Other") {
					var response = prompt("How many?");

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
		var findDigitsRegexp = /^(.*?)(\d+)([^\d]*)$/;
		var digitsCheck = findDigitsRegexp.exec(currentUrl);

		var begin = digitsCheck[1];
		var number = digitsCheck[2];
		var end = digitsCheck[3];

		var firstNum = parseInt(number, 10);
		var lastNum = firstNum;

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
})();