# Version History

## 📋 Complete Changelog

### 5.0.7 🚀

#### Major Features

- **♾️ Infinite Gallery Mode** — Load pages of images continuously as user scrolls, with loaded-range statistics and continuation guards
- **🖥️ Persisted Full-Screen Layout Toggle** — Maximise gallery viewing area with preference persistence
- **📌 Sticky Collapsible Controls** — Global toggle for persistent control bar positioning with improved responsiveness
- **📊 Progressive Loading Feedback** — Real-time loading indicators for manual mode and gallery generation
- **🍞 Toast Notifications** — User feedback for copy-to-clipboard actions
- **🎨 OS-Native Emoji Replacement** — Completely removed Font Awesome dependency in favour of standard Unicode emojis
- **🦊 Firefox Privacy Permissions** — Implemented data collection consent gating with opt-in logging per Firefox requirements
- **🛠️ Development Build Mode** — Support for building extension in development mode to aid debugging
- **🪝 Pre-Commit Hooks** — Added Husky with lint-staged for automatic code quality checks

#### Architectural Improvements

- **📡 Angular Signals Refactor** — Converted reactive state management to Angular signals for improved performance and maintainability
- **♿ Enhanced Accessibility** — Modal focus trap, improved alt text, and aria-live counter for screen readers
- **🪵 Legacy Code Removal** — Removed defunct `app-routing.module.ts`; routing now defined in `src/main.ts`

#### Bug Fixes

- **⌨️ Keyboard Navigation** — Fixed navigation bounds to respect visible media items only (addresses [#94](https://github.com/DanAtkinson/Fuskr/issues/94))
- **🔒 ZIP Download Protection** — Navigation blocked during active downloads with confirmation prompt and `beforeunload` handler (addresses [#94](https://github.com/DanAtkinson/Fuskr/issues/94))
- **🦊 Firefox Compatibility** — Corrected build issues and removed browser-incompatible `alert()`/`prompt()` usage
- **🔗 URL Handling** — Fixed percent-encoded sequence handling in `createFuskUrl` and `createTab`
- **🔧 Extension ID** — Improved extension ID resolution without requiring `chrome://extensions` page
- **🎛️ Gallery Controls** — Fixed display and sticky bar wrapping issues; prevented vertical button wrapping
- **🚨 Oversized Images** — Suppressed NG0913 warning via IMAGE_CONFIG
- **⚠️ Background Script** — Prevented unhandled rejection in FuskrRecent context menu

#### Testing & Infrastructure

- **🎭 Playwright E2E Tests** — Added comprehensive end-to-end test suite for Chrome extension with Chromium fixture
- **🔄 Vitest Migration** — Replaced Karma with Vitest for faster, more reliable unit testing with improved watch mode
- **📈 Test Coverage** — Increased coverage with additional tests for auto-removal, compression modes, video errors, and metadata; enforced 80% watermarks
- **Node.js v24 LTS** — Upgraded from v22 for improved performance and compatibility
- **Angular v21.1.2** — Updated to latest stable release
- **Jasmine v6** — Updated testing framework
- **Security Fixes** — Addressed CVE-2026-25536 and other vulnerabilities including lodash, tar, node-forge, and flatted

#### Documentation

- **📚 Rewrote Contributing Guide** — Updated `CONTRIBUTING.markdown` with current development practices
- **📝 README Corrections** — Fixed inaccuracies and extension store details
- **📋 Manifest Documentation** — Added documentation for host permissions reason

---

### 5.0.6

#### Features

- **🗑️ Auto-Remove Broken Images Setting** — Persistent option to automatically remove images that fail to load, with manual removal capability
- **🔗 Open in Tab Button** — Added button to open images directly in a new tab (addresses [#93](https://github.com/DanAtkinson/Fuskr/issues/93))
- **📦 ZIP Download Performance** — Sped up large archive downloads using STORE compression for media at scale; kept DEFLATE for small sets and metadata

#### Bug Fixes

- **🔍 Gallery Viewer Scaling** — Fixed scaling issues at >125% OS zoom levels (addresses [#93](https://github.com/DanAtkinson/Fuskr/issues/93))
- **📝 Duplicate Filename Handling** — Implemented proper zero-padded suffix numbering for duplicate filenames in downloads
- **🔐 Base64 URL Encoding** — Implemented base64 encoding for URL parameters to prevent corruption in history storage
- **👤 Incognito Mode Support** — Fixed incognito mode by switching to split mode architecture
- **📜 History Page** — Corrected critical history page display issues

#### Improvements

- **🎯 Options Page Layout** — Left-aligned labels and descriptions for better visual hierarchy

---

### 5.0.5

#### Bug Fixes

- **🔑 Manifest Key Removal** — Removed unnecessary key from manifest for Chrome Web Store API compatibility

---

### 5.0.4

#### Bug Fixes

- **🛠️ Build Issues** — Fixed v5.0.3 build errors and prepared v5.0.4 for next development cycle

---

### 5.0.3

#### Features

- **⏱️ Progressive Gallery Rendering** — Implemented progressive rendering for improved perceived performance

#### Bug Fixes

- **🔧 Extension ID** — Corrected extension ID issues

---

### 5.0.2

#### Features & Improvements

- **📍 Automated GitHub Pages Deployment** — Modern website with GitHub Actions automated deployment
- **🌐 Internationalisation of UI** — Hardcoded strings in options page now properly internationalised
- **📋 Accessibility Enhancements** — Comprehensive HTML accessibility improvements across the extension
- **🔗 Context Menu Options Access** — Fixed by using explicit tab creation instead of `chrome.runtime.openOptionsPage()`
- **⚙️ Overload Protection** — Increased limit to 250; added logging UI toggle in options page
- **🎨 Code Formatting** — Added Prettier code formatting with comprehensive auto-fix capabilities
- **✅ ESLint Configuration** — Added modern ESLint configuration for code quality

#### Infrastructure

- **🔄 GitHub Actions** — Replaced Travis CI with GitHub Actions for CI/CD pipeline
- **✅ Linting & Formatting** — Enhanced linting and formatting infrastructure configured for automated checks
- **📝 Documentation** — Comprehensive documentation restructure and modernisation
- **💾 Line Endings** — Fixed line ending issues with `.gitattributes`; corrected manifest to CRLF

#### Bug Fixes

- **🔐 URL Corruption** — Fixed URL corruption in history storage with base64 encoding
- **🛠️ Build Scripts** — Fixed Node.js version in GitHub Actions workflows
- **⚠️ TypeScript Errors** — Eliminated all TypeScript `any` types and modernised Angular patterns

#### Security

- **🔐 Extension Security Keys** — Added extension security keys for Chrome Web Store submission
- **🛡️ Vulnerability Fixes** — Fixed Node.js security vulnerabilities (lodash, tar, etc.)

---

### 5.0.1

#### Features & Improvements

- **🔐 Context Menu Fixes** — Resolved context menu access issues for options page
- **📋 Feature Overload Protection** — Added 250-item limit with logging UI toggle
- **🌐 Internationalisation** — Initial internationalisation work on UI strings

#### Infrastructure

- **🔄 GitHub Actions Setup** — Implemented GitHub Actions for CI/CD with automated building and Chrome Web Store deployment
- **✅ ESLint & Prettier** — Added ESLint and Prettier for code quality with automated formatting
- **🛡️ TypeScript Improvements** — Eliminated TypeScript `any` types throughout codebase; modernised Angular patterns
- **📚 Documentation** — Modernised documentation structure and improved troubleshooting guides

#### Bug Fixes

- **🔐 URL History** — Fixed URL corruption in history storage using base64 encoding
- **🦊 Firefox Build** — Corrected Firefox build compatibility issues
- **⚠️ Console Warnings** — Fixed logger issues and replaced deprecated `substr()` with `substring()`

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

---

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
