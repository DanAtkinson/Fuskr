import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BackgroundScript } from './background';
import { ChromeStorageData } from './app/models/chrome-storage/chrome-storage-data.model';

// Minimal Chrome API mock covering all surfaces used by BackgroundScript
const mockChrome = {
	contextMenus: {
		create: vi.fn().mockReturnValue('menu-id'),
		remove: vi.fn(),
		removeAll: vi.fn(),
		onClicked: { addListener: vi.fn() },
	},
	runtime: {
		onInstalled: { addListener: vi.fn() },
		onStartup: { addListener: vi.fn() },
		getURL: vi.fn((path: string) => `chrome-extension://fake-id/${path}`),
		id: 'fake-extension-id',
	},
	storage: {
		sync: {
			get: vi.fn(),
			set: vi.fn(),
		},
		onChanged: { addListener: vi.fn() },
	},
	tabs: {
		create: vi.fn(),
		query: vi.fn(),
	},
	omnibox: {
		onInputEntered: { addListener: vi.fn() },
	},
	i18n: {
		getMessage: vi.fn((key: string) => `[${key}]`),
	},
};

interface PrivateBackgroundScript {
	isValidWebUrl(url: string): boolean;
	l18nify(name: string): string;
	handleStorageChanges(changes: Record<string, chrome.storage.StorageChange>): void;
	createEditorTab(
		tab: chrome.tabs.Tab,
		options: { customCountDirection?: -1 | 0 | 1; errorKey?: string; prefillUrl?: string }
	): void;
	choiceOnClick(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): void;
	createRecentMenu(historyArray: string[]): void;
	recentOnClick(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab): void;
	options: ChromeStorageData;
	historyIds: [string, string][];
	recentId: string | null;
	openExtensionPage(tab: chrome.tabs.Tab, extensionPath: string): void;
}

function makeTab(overrides: Partial<chrome.tabs.Tab> = {}): chrome.tabs.Tab {
	return {
		id: 1,
		index: 0,
		windowId: 1,
		highlighted: false,
		active: true,
		pinned: false,
		incognito: false,
		selected: false,
		discarded: false,
		autoDiscardable: true,
		groupId: -1,
		url: 'https://example.com/image001.jpg',
		...overrides,
	};
}

describe('BackgroundScript', () => {
	let instance: BackgroundScript;
	let priv: PrivateBackgroundScript;

	beforeEach(() => {
		(globalThis as unknown as { chrome: typeof mockChrome }).chrome = mockChrome;

		// removeAll immediately invokes its callback so createContextMenus() completes synchronously
		mockChrome.contextMenus.removeAll.mockImplementation((cb?: () => void) => cb?.());
		// loadOptions() calls chrome.storage.sync.get — return empty object by default
		mockChrome.storage.sync.get.mockImplementation((_: unknown, cb?: (items: Record<string, unknown>) => void) =>
			cb?.({})
		);

		vi.clearAllMocks();
		// Re-apply implementations after clearAllMocks()
		mockChrome.contextMenus.removeAll.mockImplementation((cb?: () => void) => cb?.());
		mockChrome.storage.sync.get.mockImplementation((_: unknown, cb?: (items: Record<string, unknown>) => void) =>
			cb?.({})
		);

		instance = new BackgroundScript();
		priv = instance as unknown as PrivateBackgroundScript;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// -------------------------------------------------------------------------
	// Construction / initialisation
	// -------------------------------------------------------------------------
	describe('constructor', () => {
		it('should register all Chrome event listeners during initialisation', () => {
			expect(mockChrome.runtime.onInstalled.addListener).toHaveBeenCalledTimes(1);
			expect(mockChrome.runtime.onStartup.addListener).toHaveBeenCalledTimes(1);
			expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalledTimes(1);
			expect(mockChrome.contextMenus.removeAll).toHaveBeenCalledTimes(1);
		});

		it('should load options from storage on startup', () => {
			expect(mockChrome.storage.sync.get).toHaveBeenCalledTimes(1);
		});
	});

	// -------------------------------------------------------------------------
	// isValidWebUrl
	// -------------------------------------------------------------------------
	describe('isValidWebUrl', () => {
		it('should accept http:// URLs', () => {
			expect(priv.isValidWebUrl('http://example.com/image.jpg')).toBe(true);
		});

		it('should accept https:// URLs', () => {
			expect(priv.isValidWebUrl('https://example.com/image.jpg')).toBe(true);
		});

		it('should accept file:// URLs', () => {
			expect(priv.isValidWebUrl('file:///C:/images/photo.jpg')).toBe(true);
		});

		it('should reject chrome:// extension URLs', () => {
			expect(priv.isValidWebUrl('chrome://settings')).toBe(false);
		});

		it('should reject chrome-extension:// URLs', () => {
			expect(priv.isValidWebUrl('chrome-extension://abc123/index.html')).toBe(false);
		});

		it('should reject edge:// URLs', () => {
			expect(priv.isValidWebUrl('edge://newtab')).toBe(false);
		});

		it('should reject empty strings', () => {
			expect(priv.isValidWebUrl('')).toBe(false);
		});

		it('should reject null-like values gracefully', () => {
			expect(priv.isValidWebUrl(undefined as unknown as string)).toBe(false);
		});
	});

	// -------------------------------------------------------------------------
	// l18nify
	// -------------------------------------------------------------------------
	describe('l18nify', () => {
		it('should prepend Application_ prefix and call chrome.i18n.getMessage', () => {
			mockChrome.i18n.getMessage.mockReturnValue('Translated text');
			const result = priv.l18nify('ContextMenu_Fusk');
			expect(mockChrome.i18n.getMessage).toHaveBeenCalledWith('Application_ContextMenu_Fusk');
			expect(result).toBe('Translated text');
		});
	});

	// -------------------------------------------------------------------------
	// handleStorageChanges
	// -------------------------------------------------------------------------
	describe('handleStorageChanges', () => {
		it('should update display options when display key changes', () => {
			priv.handleStorageChanges({
				display: { newValue: { darkMode: true }, oldValue: { darkMode: false } },
			});
			expect(priv.options.display.darkMode).toBe(true);
		});

		it('should update behaviour options when behaviour key changes', () => {
			priv.handleStorageChanges({
				behaviour: { newValue: { openInForeground: false }, oldValue: { openInForeground: true } },
			});
			expect(priv.options.behaviour.openInForeground).toBe(false);
		});

		it('should update safety options when safety key changes', () => {
			priv.handleStorageChanges({
				safety: { newValue: { overloadProtectionLimit: 500 }, oldValue: { overloadProtectionLimit: 250 } },
			});
			expect(priv.options.safety.overloadProtectionLimit).toBe(500);
		});

		it('should update version when version key changes', () => {
			priv.handleStorageChanges({
				version: { newValue: 2, oldValue: 1 },
			});
			expect(priv.options.version).toBe(2);
		});

		it('should handle null/undefined changes object gracefully', () => {
			expect(() =>
				priv.handleStorageChanges(null as unknown as Record<string, chrome.storage.StorageChange>)
			).not.toThrow();
		});
	});

	// -------------------------------------------------------------------------
	// createEditorTab (URL parameter construction)
	// -------------------------------------------------------------------------
	describe('createEditorTab', () => {
		let capturedPath: string | null;

		beforeEach(() => {
			capturedPath = null;
			mockChrome.tabs.query.mockImplementation((_: unknown, cb: (tabs: chrome.tabs.Tab[]) => void) => {
				cb([makeTab()]);
			});
			mockChrome.runtime.getURL.mockImplementation((path: string) => {
				capturedPath = path;
				return `chrome-extension://fake-id/${path}`;
			});
		});

		it('should open gallery page with no query string when no options supplied', () => {
			priv.createEditorTab(makeTab(), {});
			expect(capturedPath).toBe('index.html#gallery');
		});

		it('should base64-encode the prefill URL', () => {
			const url = 'https://example.com/image001.jpg';
			priv.createEditorTab(makeTab(), { prefillUrl: url });
			// URLSearchParams encodes the base64 = padding as %3D
			expect(capturedPath).toContain(`prefill=${encodeURIComponent(btoa(url))}`);
		});

		it('should include customCount and direction params when customCountDirection is set', () => {
			priv.createEditorTab(makeTab(), { customCountDirection: 1 });
			expect(capturedPath).toContain('customCount=1');
			expect(capturedPath).toContain('direction=1');
		});

		it('should include direction=-1 correctly', () => {
			priv.createEditorTab(makeTab(), { customCountDirection: -1 });
			expect(capturedPath).toContain('direction=-1');
		});

		it('should include direction=0 when zero is specified', () => {
			priv.createEditorTab(makeTab(), { customCountDirection: 0 });
			expect(capturedPath).toContain('direction=0');
		});

		it('should include errorKey param when supplied', () => {
			priv.createEditorTab(makeTab(), { errorKey: 'Application_Prompt_NotAValidFusk' });
			expect(capturedPath).toContain('errorKey=Application_Prompt_NotAValidFusk');
		});
	});

	// -------------------------------------------------------------------------
	// choiceOnClick — direction parsing
	// -------------------------------------------------------------------------
	describe('choiceOnClick', () => {
		let capturedPath: string | null;

		beforeEach(() => {
			capturedPath = null;
			mockChrome.tabs.query.mockImplementation((_: unknown, cb: (tabs: chrome.tabs.Tab[]) => void) => {
				cb([makeTab()]);
			});
			mockChrome.runtime.getURL.mockImplementation((path: string) => {
				capturedPath = path;
				return `chrome-extension://fake-id/${path}`;
			});
			// i18n returns a translation that doesn't match 'Other' so numeric path is taken
			mockChrome.i18n.getMessage.mockReturnValue('Other');
		});

		it('should open editor tab with error when no URL is in context info', () => {
			const info = {
				menuItemId: 'Fuskr_IncDec_10_One',
				linkUrl: undefined,
				srcUrl: undefined,
			} as unknown as chrome.contextMenus.OnClickData;
			priv.choiceOnClick(info, makeTab());
			expect(capturedPath).toContain('errorKey=Application_Prompt_NotAValidFusk');
		});

		it('should open editor in custom-count mode when menu item is "Other"', () => {
			const info = {
				menuItemId: 'Fuskr_IncDec_Other_One',
				linkUrl: 'https://example.com/image001.jpg',
			} as unknown as chrome.contextMenus.OnClickData;
			priv.choiceOnClick(info, makeTab());
			expect(capturedPath).toContain('customCount=1');
			expect(capturedPath).toContain('direction=1');
		});

		it('should open editor with error for unparseable menu item ID', () => {
			const info = {
				menuItemId: 'InvalidMenuId',
				linkUrl: 'https://example.com/image001.jpg',
			} as unknown as chrome.contextMenus.OnClickData;
			priv.choiceOnClick(info, makeTab());
			expect(capturedPath).toContain('errorKey');
		});
	});

	// -------------------------------------------------------------------------
	// createRecentMenu
	// -------------------------------------------------------------------------
	describe('createRecentMenu', () => {
		it('should do nothing when history array is empty', () => {
			mockChrome.contextMenus.create.mockClear();
			priv.createRecentMenu([]);
			expect(priv.recentId).toBeNull();
			expect(mockChrome.contextMenus.create).not.toHaveBeenCalled();
		});

		it('should create a parent menu and one child per non-empty history entry', () => {
			mockChrome.contextMenus.create.mockClear();
			priv.createRecentMenu(['https://example.com/a[1-5].jpg', 'https://example.com/b[1-3].jpg']);
			// 1 parent + 2 history items + 1 separator + 1 clear = 5
			expect(mockChrome.contextMenus.create).toHaveBeenCalledTimes(5);
		});

		it('should remove the previous recent menu before creating a new one', () => {
			priv.recentId = 'old-recent-id';
			priv.createRecentMenu(['https://example.com/a[1-5].jpg']);
			expect(mockChrome.contextMenus.remove).toHaveBeenCalledWith('old-recent-id');
		});

		it('should skip empty string entries in the history array', () => {
			mockChrome.contextMenus.create.mockClear();
			priv.createRecentMenu(['https://example.com/a[1-5].jpg', '', 'https://example.com/b[1-3].jpg']);
			// 1 parent + 2 valid items + 1 separator + 1 clear = 5
			expect(priv.historyIds).toHaveLength(2);
		});
	});

	// -------------------------------------------------------------------------
	// recentOnClick
	// -------------------------------------------------------------------------
	describe('recentOnClick', () => {
		beforeEach(() => {
			priv.historyIds = [
				['FuskrHistory_0', 'https://example.com/a[1-5].jpg'],
				['FuskrHistory_1', 'https://example.com/b[1-10].jpg'],
			];
			mockChrome.tabs.query.mockImplementation((_: unknown, cb: (tabs: chrome.tabs.Tab[]) => void) => {
				cb([makeTab()]);
			});
			mockChrome.runtime.getURL.mockImplementation((path: string) => `chrome-extension://fake-id/${path}`);
		});

		it('should open the correct URL for a valid history index', () => {
			const info = { menuItemId: 'FuskrHistory_1' } as unknown as chrome.contextMenus.OnClickData;
			priv.recentOnClick(info, makeTab());
			expect(mockChrome.tabs.create).toHaveBeenCalledWith(
				expect.objectContaining({ url: expect.stringContaining(btoa('https://example.com/b[1-10].jpg')) })
			);
		});

		it('should warn and not open a tab for an out-of-range index', () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
			const info = { menuItemId: 'FuskrHistory_99' } as unknown as chrome.contextMenus.OnClickData;
			priv.recentOnClick(info, makeTab());
			expect(warnSpy).toHaveBeenCalled();
			expect(mockChrome.tabs.create).not.toHaveBeenCalled();
		});

		it('should warn when historyIds is empty', () => {
			priv.historyIds = [];
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
			const info = { menuItemId: 'FuskrHistory_0' } as unknown as chrome.contextMenus.OnClickData;
			priv.recentOnClick(info, makeTab());
			expect(warnSpy).toHaveBeenCalled();
		});
	});
});
