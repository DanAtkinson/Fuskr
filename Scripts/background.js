/* globals chrome, alert, prompt, Fuskr */
(function () {

    var i = 0,
        ids = [],
        recentId = 0,
        parentId = -1,
        historyIds = [],
        targetUrls,
        options = {
            keepFusks: true,
            openInForeground: true,
            history: [],
        };

    //Target urls tell Chrome what urls are acceptable.
    targetUrls = (function () {
        var targetUrls = [];

        //Create regex patterns to match only urls that contain numbers
        for (var i = 0; i <= 9; i++) {
            targetUrls.push('*://*/*' + i + '*');
        }
        return targetUrls;
    })();

    (function () {
        var incDecMenuId, incMenuId, decMenuId, numbers, i;

        numbers = [l18nify('ContextMenu_10'), l18nify('ContextMenu_20'), l18nify('ContextMenu_50'), l18nify('ContextMenu_100'), l18nify('ContextMenu_200'), l18nify('ContextMenu_500'), l18nify('ContextMenu_Other')];

        //First, empty all the context menus for this extension.
        chrome.contextMenus.removeAll();

        parentId = createContextMenu({ Title: l18nify('ContextMenu_Fusk'), Context: ['all'] });
        incDecMenuId = createContextMenu({ Id: parentId, Title: '+/-', Context: ['image', 'video', 'audio', 'link'], TargetUrlPatterns: targetUrls });
        incMenuId = createContextMenu({ Id: parentId, Title: '+', Context: ['image', 'video', 'audio', 'link'], TargetUrlPatterns: targetUrls });
        decMenuId = createContextMenu({ Id: parentId, Title: '-', Context: ['image', 'video', 'audio', 'link'], TargetUrlPatterns: targetUrls });

        for (i = 0; i < numbers.length; i++) {
            ids.push([createContextMenu({ Id: incDecMenuId, Title: numbers[i], Context: ['image', 'video', 'audio', 'link'], OnclickCallback: choiceOnClick }), 0, numbers[i]]);
            ids.push([createContextMenu({ Id: incMenuId, Title: numbers[i], Context: ['image', 'video', 'audio', 'link'], OnclickCallback: choiceOnClick }), 1, numbers[i]]);
            ids.push([createContextMenu({ Id: decMenuId, Title: numbers[i], Context: ['image', 'video', 'audio', 'link'], OnclickCallback: choiceOnClick }), -1, numbers[i]]);
        }

        createContextMenu({ Id: parentId, Context: ['image', 'video', 'audio', 'link'], ItemType: 'separator' });
        createContextMenu({ Id: parentId, Title: l18nify('ContextMenu_CreateFromSelection'), Context: ['selection'], OnclickCallback: createFromSelectionOnClick });
        createContextMenu({ Id: parentId, Title: l18nify('ContextMenu_Manual'), OnclickCallback: manualOnClick });
        //createContextMenu({ Id: parentId, Title: l18nify('ContextMenu_Infinite'), OnclickCallback: infiniteOnClick });
        createContextMenu({ Id: parentId, ItemType: 'separator' });

        createContextMenu({ Id: parentId, Title: l18nify('ContextMenu_Options'), OnclickCallback: optionsOnClick });

        // This event is fired with the user accepts the input in the omnibox.
        chrome.omnibox.onInputEntered.addListener(function (text) {
            chrome.tabs.getSelected(null, function (tab) {
                createTab(text, tab);
            });
        });
    }());

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

        recentId = createContextMenu({ Id: parentId, Title: l18nify('ContextMenu_Recent') });

        for (i = 0; i < historyArray.length; i++) {
            if (historyArray[i] !== '') {
                //Add the menu
                historyId = createContextMenu({ Id: recentId, Title: historyArray[i], OnclickCallback: recentOnClick });
                historyIds.push([historyId, historyArray[i]]);
            }
        }

        if (historyArray.length > 0) {
            createContextMenu({ Id: recentId, ItemType: 'separator' });
            createContextMenu({ Id: recentId, Title: l18nify('ContextMenu_ClearRecentActivity'), OnclickCallback: clearRecentOnClick });
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
        for (i = 0; i < historyIds.length; i++) {
            if (historyIds[i][0] === info.menuItemId) {
                createTab(historyIds[i][1], tab);
                break;
            }
        }
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
            selected: options.openInForeground
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

        for (i = 0; i < ids.length; i++) {
            if (ids[i][0] === info.menuItemId) {

                direction = parseInt(ids[i][1], 10);

                if (ids[i][2] === l18nify('ContextMenu_Other')) {
                    response = prompt(l18nify('Prompt_HowMany'));

                    if (isNaN(response) === true) {
                        alert(l18nify('Prompt_NotAValidNumber'));
                        break;
                    }
                    count = parseInt(response, 10);
                } else {
                    count = parseInt(ids[i][2], 10);
                }

                var fuskUrl = Fuskr.CreateFuskUrl(url, count, direction);
                createTab(fuskUrl, tab);
                break;
            }
        }
    }

    function createContextMenu(obj) {
        //Generate a new context menu item with a dynamically generated guid.
        var contextMenuId = chrome.contextMenus.create({
            parentId: obj.Id,
            title: obj.Title,
            contexts: obj.Context || ['all'],
            type: obj.ItemType || 'normal',
            targetUrlPatterns: obj.TargetUrlPatterns || null,
            id: ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
        });

        //As we can't use onclick with contextMenus.create, create a new listener that is specific to this context menu Id.
        chrome.contextMenus.onClicked.addListener(function (info, tab) {
            if (info.menuItemId === contextMenuId)  {
                obj.OnclickCallback(info, tab);
            }
        });

        return contextMenuId;
    }

    chrome.runtime.onInstalled.addListener(function (details) {
        if (details.reason === 'install') {

            // First install - set defaults
            chrome.storage.sync.set({
                history: [],
                keepRecentFusks: true,
                openInForeground: true
            });
        } else if (details.reason === 'update') {
            var previousKeepFusks = localStorage.getItem('keepRecentFusks') || '1';
            var previousOpenInForeground = localStorage.getItem('openInForeground') || '1';
            var previousHistory = localStorage.getItem('history') || '';

            // Was previously stored as 0/1
            var keepFusksBool = parseInt(previousKeepFusks, 10) === 1;
            var openForegroundBool = parseInt(previousOpenInForeground, 10) === 1;

            // Was previously stored delimited by ||
            var historyArray = previousHistory.split('||').filter(function (x) {
                return x !== null && typeof x !== 'undefined' && x.length > 0;
            });

            localStorage.clear();

            chrome.storage.sync.set({
                history: historyArray,
                keepRecentFusks: keepFusksBool,
                openInForeground: openForegroundBool
            });
        }
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
        Object.keys(items).map(function (key) {
            options[key] = items[key];
        });
    });
}());
