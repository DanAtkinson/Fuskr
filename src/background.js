// Background service worker for Fuskr extension
// Manifest V3 compatible with cross-browser support

// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Import the Fuskr service logic
// Note: In a real implementation, you'd want to bundle this properly
importScripts('fuskr-core.js');

// Context menu and omnibox functionality
let recentId = 0;
let parentId = -1;
let historyIds = [];

const options = {
	darkMode: false,
	keepRecentFusks: true,
	openInForeground: true,
	recentFusks: []
};

// Initialise extension
browserAPI.runtime.onInstalled.addListener(() => {
	setupContextMenus();
	loadOptions();
});

// Load options from storage
async function loadOptions() {
	try {
		const data = await browserAPI.storage.sync.get(null);
		Object.assign(options, data);
		updateRecentMenu();
	} catch (error) {
		console.error('Error loading options:', error);
	}
}

// Save options to storage
async function saveOptions() {
	try {
		await browserAPI.storage.sync.set(options);
	} catch (error) {
		console.error('Error saving options:', error);
	}
}

// Get localised message
function getMessage(name) {
	return browserAPI.i18n.getMessage('Application_' + name) || name;
}

// Create context menu item
function createContextMenu(params) {
	try {
		return browserAPI.contextMenus.create({
			id: params.Id,
			parentId: params.ParentId || undefined,
			title: params.Title,
			contexts: ['all'],
			targetUrlPatterns: params.ParentId ? undefined : ['*://*/*[0-9]*']
		});
	} catch (error) {
		console.error('Error creating context menu:', error);
		return null;
	}
}

// Setup main context menus
function setupContextMenus() {
	// Remove existing menus
	browserAPI.contextMenus.removeAll(() => {
		// Main context menu - using the correct localisation key
		parentId = createContextMenu({
			Id: 'FuskrContextMenu',
			Title: getMessage('ContextMenu_Fusk')
		});

		// Create from selection option
		createContextMenu({
			Id: 'FuskrCreateFromSelection',
			ParentId: parentId,
			Title: getMessage('ContextMenu_CreateFromSelection')
		});

		// Manual fusk option
		createContextMenu({
			Id: 'FuskrManual',
			ParentId: parentId,
			Title: getMessage('ContextMenu_Manual')
		});

		// Submenu for predefined counts
		const countMenuId = createContextMenu({
			Id: 'FuskrCounts',
			ParentId: parentId,
			Title: 'Quick Fusk'
		});

		// Quick count options
		['10', '20', '50', '100'].forEach(count => {
			createContextMenu({
				Id: `FuskrCount_${count}`,
				ParentId: countMenuId,
				Title: `±${count}`
			});
		});

		// Other count option
		createContextMenu({
			Id: 'FuskrOther',
			ParentId: countMenuId,
			Title: getMessage('ContextMenu_Other')
		});

		// Separator
		createContextMenu({
			Id: 'FuskrSeparator1',
			ParentId: parentId,
			Title: '---'
		});

		// Options
		createContextMenu({
			Id: 'FuskrOptions',
			ParentId: parentId,
			Title: getMessage('ContextMenu_Options')
		});

		// Recent fusks
		updateRecentMenu();
	});
}

// Update recent fusks menu
function updateRecentMenu() {
	if (recentId !== 0) {
		browserAPI.contextMenus.remove(recentId);
		recentId = 0;
	}

	historyIds = [];

	if (!options.keepRecentFusks || !options.recentFusks || options.recentFusks.length === 0) {
		return;
	}

	recentId = createContextMenu({
		Id: 'FuskrRecent',
		ParentId: parentId,
		Title: getMessage('ContextMenu_Recent')
	});

	options.recentFusks.forEach((url, index) => {
		if (url && url.trim()) {
			const historyId = createContextMenu({
				Id: `FuskrHistory_${index}`,
				ParentId: recentId,
				Title: url
			});
			if (historyId) {
				historyIds.push([historyId, url]);
			}
		}
	});

	// Add clear option
	if (options.recentFusks.length > 0) {
		createContextMenu({
			Id: 'FuskrClearHistory',
			ParentId: recentId,
			Title: getMessage('ContextMenu_ClearRecentActivity')
		});
	}
}

// Handle context menu clicks
browserAPI.contextMenus.onClicked.addListener(async (info, tab) => {
	const url = info.linkUrl || info.pageUrl || tab.url;

	try {
		switch (info.menuItemId) {
			case 'FuskrCreateFromSelection':
				await handleCreateFromSelection(info.selectionText || url);
				break;
			case 'FuskrManual':
				await handleManualFusk();
				break;
			case 'FuskrCount_10':
				await handleQuickFusk(url, 10);
				break;
			case 'FuskrCount_20':
				await handleQuickFusk(url, 20);
				break;
			case 'FuskrCount_50':
				await handleQuickFusk(url, 50);
				break;
			case 'FuskrCount_100':
				await handleQuickFusk(url, 100);
				break;
			case 'FuskrOther':
				await handleCustomCount(url);
				break;
			case 'FuskrOptions':
				await openOptionsPage();
				break;
			case 'FuskrClearHistory':
				await clearHistory();
				break;
			default:
				if (info.menuItemId.startsWith('FuskrHistory_')) {
					const historyIndex = parseInt(info.menuItemId.split('_')[1]);
					const historicalUrl = options.recentFusks[historyIndex];
					if (historicalUrl) {
					await handleFuskFromUrl(historicalUrl);
					}
				}
				break;
		}
	} catch (error) {
		console.error('Error handling context menu click:', error);
	}
});

// Handle different fusk operations
async function handleCreateFromSelection(selectedText) {
	if (selectedText && isFuskable(selectedText)) {
		await addToHistory(selectedText);
		await openFuskTab(selectedText);
	} else if (selectedText) {
		// Try to create a fuskable URL from selection
		const fuskUrl = createFuskUrl(selectedText, 10, 0);
		await addToHistory(fuskUrl);
		await openFuskTab(fuskUrl);
	}
}

async function handleManualFusk() {
	// Open the main extension page for manual input
	await browserAPI.tabs.create({
		url: `${browserAPI.runtime.getURL('index.html')}`,
		active: options.openInForeground
	});
}

async function handleQuickFusk(url, count) {
	if (isFuskable(url)) {
		await addToHistory(url);
		await openFuskTab(url);
	} else {
		const fuskUrl = createFuskUrl(url, count, 0);
		await addToHistory(fuskUrl);
		await openFuskTab(fuskUrl);
	}
}

async function handleCustomCount(url) {
	// This would ideally open a popup, but for now use a simple approach
	const fuskUrl = createFuskUrl(url, 25, 0); // Default to 25
	await addToHistory(fuskUrl);
	await openFuskTab(fuskUrl);
}

async function handleFuskFromUrl(url) {
	if (isFuskable(url)) {
		await addToHistory(url);
		await openFuskTab(url);
	}
}

async function openOptionsPage() {
	await browserAPI.tabs.create({
		url: `${browserAPI.runtime.getURL('index.html')}#/options`,
		active: options.openInForeground
	});
}

async function clearHistory() {
	options.recentFusks = [];
	await saveOptions();
	updateRecentMenu();
}

// Add URL to history
async function addToHistory(url) {
	if (!options.keepRecentFusks) return;

	// Remove if already exists
	const index = options.recentFusks.indexOf(url);
	if (index > -1) {
		options.recentFusks.splice(index, 1);
	}

	// Add to beginning
	options.recentFusks.unshift(url);

	// Keep only last 10
	options.recentFusks = options.recentFusks.slice(0, 10);

	await saveOptions();
	updateRecentMenu();
}

// Open fusk in new tab
async function openFuskTab(url) {
	try {
		await browserAPI.tabs.create({
			url: `${browserAPI.runtime.getURL('index.html')}#/gallery?url=${encodeURIComponent(url)}`,
			active: options.openInForeground
		});
	} catch (error) {
		console.error('Error opening fusk tab:', error);
	}
}

// Omnibox functionality
if (browserAPI.omnibox) {
	browserAPI.omnibox.onInputEntered.addListener(async (text) => {
	try {
		let url = text;

		// If it doesn't look like a URL, try to make it one
		if (!url.includes('://')) {
		url = 'http://' + url;
		}

		if (isFuskable(url)) {
		await handleFuskFromUrl(url);
		} else {
		// Try to create a fuskable URL
		const fuskUrl = createFuskUrl(url, 10, 0);
		await handleFuskFromUrl(fuskUrl);
		}
	} catch (error) {
		console.error('Error handling omnibox input:', error);
	}
	});
}

// Listen for storage changes
browserAPI.storage.onChanged.addListener((changes, area) => {
	if (area === 'sync') {
	Object.keys(changes).forEach(key => {
		if (key in options) {
		options[key] = changes[key].newValue;
		}
	});
	updateRecentMenu();
	}
});

// Helper functions (simplified versions of the original Fuskr functions)
function isFuskable(url) {
	const numericRegex = /^(.*?)\[(\d+)-(\d+)\](.*)$/;
	const alphabeticRegex = /^(.*?)\[(\w)-(\w)\](.*)$/;
	return numericRegex.test(url) || alphabeticRegex.test(url) || /\d/.test(url);
}

function createFuskUrl(url, count, direction) {
	const findDigitsRegexp = /^(.*?)(\d+)([^\d]*)$/;
	const digitsCheck = findDigitsRegexp.exec(url);

	if (!digitsCheck) {
	return url;
	}

	const begin = digitsCheck[1];
	const number = digitsCheck[2];
	const end = digitsCheck[3];

	const originalNum = parseInt(number, 10);
	let firstNum = originalNum;
	let lastNum = originalNum;

	if (direction === 0) {
	firstNum -= count;
	lastNum += count;
	} else if (direction === -1) {
	firstNum -= count;
	} else if (direction === 1) {
	lastNum += count;
	}

	firstNum = Math.max(0, firstNum);
	lastNum = Math.max(0, lastNum);

	let firstNumStr = firstNum.toString();
	let lastNumStr = lastNum.toString();

	// Pad with zeros to match original length
	while (firstNumStr.length < number.length) {
	firstNumStr = '0' + firstNumStr;
	}

	while (lastNumStr.length < firstNumStr.length) {
	lastNumStr = '0' + lastNumStr;
	}

	return begin + '[' + firstNumStr + '-' + lastNumStr + ']' + end;
}
