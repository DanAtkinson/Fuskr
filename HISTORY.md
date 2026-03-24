# Version History

## 📋 Complete Changelog

### 5.0.7

#### Bug Fixes

- **🖼️ End key now navigates to the last visible image** — When broken images were hidden, the End key would overshoot the visible list and silently do nothing. All keyboard navigation (End, Home, arrow keys) now uses the filtered visible image list ([#94](https://github.com/DanAtkinson/Fuskr/issues/94))
- **🛡️ Navigation blocked during active ZIP download** — Clicking "View Options" or "History" while a ZIP download was in progress would silently cancel it. A confirmation prompt is now shown, and the browser's `beforeunload` event is also handled to catch tab closes and navigations ([#94](https://github.com/DanAtkinson/Fuskr/issues/94))
- **🦊 Firefox build corrections** — Resolved Firefox extension build issues; replaced use of `alert()`/`prompt()` with browser-compatible alternatives

#### Improvements

- **🧪 Playwright end-to-end tests** — Added full Playwright e2e test suite for the Chrome extension, loading the unpacked extension in a real Chromium browser
- **⚡ Migrated from Karma to Vitest** — Faster, more reliable unit test runner with improved watch mode and coverage reporting
- **📈 Increased unit test coverage** — Additional tests for session auto-removal, compression modes, video error handling, metadata, and URL decoding; 80% coverage watermarks enforced on the build

#### Dependency Updates

- Upgraded to Angular v21.1.2 (latest stable)
- Updated to Node.js v24 LTS across all configurations
- Font Awesome upgraded from 6.x to 7.1.0
- Fixed CVE-2026-25536 security vulnerability
- Multiple dependency bumps for security and compatibility (tar, lodash, flatted, hono, immutable, node-forge, jasmine-core, @types/jasmine)

---

### 5.0.0 ⭐ **Major Release**

- **🏗️ Major Architecture Overhaul** - Complete rewrite using Angular 20.1.2 with TypeScript for modern, maintainable code
- **🚀 Chrome Extension Manifest V3** - Full compliance with latest Chrome Extension standards using service workers
- **⌨️ Keyboard Navigation** - Added comprehensive keyboard controls for gallery navigation (Arrow keys, Page Up/Down, Home/End, etc.)
- **📁 Structured Code Architecture** - Implemented single responsibility principle with organised interfaces and models in separate files
- **🔧 Enhanced Build System** - Modern webpack-based build process with automated packaging for both Chromium and Firefox
- **🧪 Comprehensive Testing** - 223 passing unit tests with full code coverage and robust testing framework
- **📝 Logger Service** - Advanced debugging and monitoring capabilities for better troubleshooting
- **🔄 Chrome Sync Ready** - Modern storage architecture prepared for cross-device synchronisation
- **🛡️ Type Safety** - Complete TypeScript migration with proper typing throughout the codebase
- **📦 Clean Dependencies** - Organised folder structure with proper imports and modular design

### 4.0.75

- Omnibox and history should now be working correctly again.

### 4.0.61

- Fix issues with the context menus not working correctly in Chrome. Firefox was unaffected but the solution is cross-browser compatible.

### 4.0.20

- Create dark mode option.
- Tidy up code and improve some speed issues, specifically around context menu creation.
- New version numbering. Minor version is incremented and we also include a longer version name indicating the build date/time.

### 3.2

- Download images as a zip file and retain the structure if it's a nested fusk!
- Options page change to support Chrome's preferred options layout.
- Improvements to the way many urls are handled.

### 3.1

- Fixed an issue with the fusk option not showing on links.

### 3.0

- Application templating rewritten using [AngularJS](https://angularjs.org/).

### 2.7

- Reduced the permissions level greatly. Previously, Fuskr required that you give us access to all websites and all browsing activity, but we only care about your current tab. Google Chrome now has that ability, so we've reduced the permissions needed accordingly!
- Fixed an annoying bug where Fuskr wouldn't work on some links that didn't have numbers, and wouldn't revert to the image url.

### 2.6

- You can now download images directly from the gallery page!
- You can now view the page in a slideshow!
- Beginning to internationalise (l18n). If you want to help, let us know!
- Updated to jQuery and jQuery UI.

### 2.5

- Updated to jQuery v2.1.3 and jQuery UI 1.11.2.

### 2.4

- Updated to jQuery v2 and jQuery UI 1.10.3.
- Minor styling changes to the image gallery page.

### 2.3

- Fixed some template issues and added more information and credits to the options page.

### 2.2

- Added the ability to create a fusk by typing 'fuskr' in the omnibox, followed by your fusk url!
- Updated libraries used by Fuskr.

### 2.1

- Updated Fuskr with new icon/image goodness kindly provided by Richard Stelmach of Creative Binge!

### 2.0

- Alphabetical fusking is now possible! You can now do fusks such as https://example.com/path/file/[a-z].jpg or even https://domain.com/path/file/[a-z]and[c-g]and[j-m].jpg
- Changes to the options page to make it much cleaner.

### 1.9.1

- Some changes to the application in order to take into account recent security update to Google Chrome which will be enforced shortly.

### 1.9

- Fuskr wasn't working on Macs.

### 1.8

- Change of name to Fuskr.
- Jonathon Bolster has put a lot of work into making Fuskr modular, and there are now a few unit tests around to make sure everything's hunky dory!
- Fixed some issues with previous/next functionality not working when there are images missing. It also scrolls smoothly as well.

### 1.7

- Added linkage below images.

### 1.6

- A few bug fixes. Incognito works properly now, but only in v9 as there are some Chrome bugs outstanding.

### 1.5

- Fixing a bug with the '+' icon showing up unnecessarily.
- Galleries created in incognito mode are no longer stored.
- Added the ability to scale images to the current window size.
- Added some information about the current gallery (number of images and broken images).

### 1.4

- Clicking a created image will jump the user to the next one. Manual fusks are a little more difficult so maybe that's one for later...
- Added an options page! Currently the only two options are below.
- Added recent fusks history. This allows you to keep track of and, if desired, go back to a previous one that you may have closed. This feature will only store 10 at maximum, can be disabled completely, or the history can be wiped.
- Added an option for opening a gallery in the foreground.

### 1.3

- Fixed a bug where having a nested gallery meant that the images were returned in the wrong order. - Kudos Jonathon!
- Fixed an issue where the ChromeFusk option appears, even when the image is not 'fusk-able' - Kudos Jonathon!
- Fixed an issue where choosing a manual gallery and not entering a url would still try to create a new tab. Kudos Jonathon!
- Provided an 'option' for having the new gallery show on creation, or open in the background (default is open in the foreground).

### 1.2

- Fixed a bug where the horizontal scrollbar was not visible for galleries where the images were bigger than the page.
- Added the ability to use create a gallery based on a thumbnail, which will go to the linked image instead.

### 1.1

- About 5 minutes after I released 1.0, I realised that Chrome had finally allowed extensions to create context menus, so I ripped my application apart and rebuilt it in thirty minutes to use the context menus.

### 1.0 🎉 **Initial Release**

- Initial release.
