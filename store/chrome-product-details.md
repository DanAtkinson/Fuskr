Fuskr - create instant image galleries from numbered URLs

Turn any numbered image URL into a browsable gallery in seconds. If you’re on https://example.com/images/08.jpg, Fuskr can automatically find and display the full sequence (e.g. 01–16) with a clean, responsive grid and a built-in viewer.

What Fuskr does
- Create galleries from a single image link by detecting numeric ranges (and even alphabetic ranges)
- Support patterns like https://example.com/file[1-16].jpg or [a-z].jpg
- Show a fast grid with a modal viewer and keyboard navigation
- Skip or dim broken media automatically (configurable), with one-click removal
- Open any image in a new tab, copy URLs, or download everything as a ZIP
- Remember your preferred display mode (fit on page, full width, fill page, thumbnails)
- Dark mode and accessible touch targets for comfortable browsing

How to use
1. Right-click an image and choose “Fusk” (or use the omnibox keyword: type fuskr then your URL).
2. Choose a direction:
   - +/− → show items before and after
   - + → only items after
   - − → only items before
3. Pick a gallery size (10/20/50/100/200/500 or Other).
4. Your gallery opens in a new tab. You can toggle broken media visibility at any time.


=== Why 'Fusk'? ===

https://en.wikipedia.org/wiki/Fusker - Fusker is a type of website or utility that extracts images from a web page, typically from free hosted galleries. Fusker software allows users to identify a sequence of images with a single pattern, for example: https://www.example.com/images/pic[1-16].jpg.


=== Version History ===
(Dates reflect recorded release tags; some early releases predate version tagging and have no recorded date.)

- 5.0.17 (2026-08-14) -
           - Fixed a Firefox packaging bug where the extension could fail to load with "background.service_worker is currently disabled".
           - Corrected build pipeline ordering so the Firefox manifest and background script are no longer overwritten by the Chrome build output.
           - Updated Angular and other dependencies to their latest compatible versions.
- 5.0.16 (2026-08-12) -
           - Updated to Angular 22 and refreshed the underlying build, test and lint tooling.
           - Fixed Firefox Manifest V3 packaging and validation so Firefox builds pass store checks.
           - Improved compatibility with non-standard/numbered media URLs.
           - Clarified grouped range placeholder syntax ({0}, {1}, and so on) for advanced patterns.
           - General CI, build stability and dependency maintenance.
- 5.0.15 (2026-04-10) - Corrected version numbering issues from 5.0.7-5.0.14 releases.
- 5.0.7 (2026-03-31) -
           - Added infinite gallery mode (continuous loading while scrolling).
           - Added persisted full-screen layout toggle and sticky collapsible controls.
           - Added progressive loading feedback and toast notifications for copy actions.
           - Replaced Font Awesome icons with native OS emoji.
           - Added Firefox privacy/data-collection consent gating for logging.
           - Converted internal state management to Angular signals.
           - Improved accessibility: modal focus trap, better alt text, aria-live counters.
           - Fixed keyboard navigation bounds and added zip-download protection against navigating away mid-download.
           - Added Playwright end-to-end tests and migrated unit tests to Vitest.
- 5.0.6 (2025-10-02) -
           - Added an auto-remove setting for broken images, plus manual removal.
           - Added an 'open in tab' button for images.
           - Faster zip downloads for large galleries.
           - Fixed gallery scaling at high OS zoom levels and duplicate filename handling on download.
           - Fixed incognito mode support.
- 5.0.2 (2025-08-14) -
           - Automated GitHub Pages deployment and internationalised remaining UI strings.
           - Accessibility improvements throughout the extension.
           - Raised the overload protection limit to 250 items with a logging toggle in options.
           - Replaced Travis CI with GitHub Actions; added Prettier and ESLint.
- 5.0.1 -
           - Fixed context menu access to the options page.
           - Added a 250-item overload protection limit.
           - Began internationalising UI strings.
- 5.0.0 (2025-08-12) - Major rewrite: migrated to Angular and TypeScript, adopted Chrome Extension Manifest V3, added keyboard navigation, and introduced a modern, well-tested codebase.
- 4.0.84 -
           - Resolve issues with incognito not working.
- 4.0.75 (2019-07-05) -
           - Omnibox and history should now be working correctly again.
- 4.0.61 (2019-07-05) -
           - Fix issues with the context menus not working correctly in Chrome. Firefox was unaffected but the solution is cross-browser compatible.
- 4.0.20 (2019-07-03) -
           - Create dark mode option.
           - Tidy up code and improve some speed issues, specifically around context menu creation.
           - New version numbering. Minor version is incremented and we also include a longer version name indicating the build date/time.
- 3.2 (2017-09-09) -
           - More excellent work by Jonathon Bolster!
           - Download images as a zip file and retain the structure if it's a nested fusk!
           - Options page change to support Chrome's preferred options layout.
           - Improvements to the way many urls are handled.
- 3.1 (2016-04-20) -
           - Fixed an issue with the fusk option not showing on links.
- 3.0 (2016-04-19) -
           - Application templating rewritten using AngularJS.
- 2.7 -
           - Fixed an annoying bug where Fuskr wouldn't work on some links that didn't have numbers, and wouldn't revert to the image url.
           - Reduced the permissions level greatly. Previously, Fuskr required that you give us access to all websites and all browsing activity, but we only care about your current tab. Google Chrome now has that ability, so we've reduced the permissions needed accordingly!
- 2.6 (2015-05-05) -
           - You can now download images directly from the gallery page!
           - You can now view the page in a slideshow!
           - Beginning to internationalize (l18n). If you want to help, let us know!
           - Updated to jQuery and jQuery UI.
- 2.5 - Updated to jQuery v2.1.3 and jQuery UI 1.11.2.
- 2.4 - Updated to jQuery v2 and jQuery UI 1.10.3.
           - Minor styling changes to the image gallery page.
- 2.3 - Fixed some template issues and added more information and credits to the options page.
- 2.2 - Added the ability to create a fusk by typing 'fuskr' in the omnibox, followed by your fusk url!
- 2.1 - Updated Fuskr with new icon/image goodness kindly provided by Richard Stelmach of Creative Binge!
- 2.0 -
           - Alphabetical fusking is now possible! You can now do fusks such as https://example.com/path/file/[a-z].jpg or even https://domain.com/path/file/[a-z]and[c-g]and[j-m].jpg!
           - Changes to the options page to make it much cleaner.
- 1.9.1 -
           - Some changes to the application in order to take into account recent security update to Google Chrome which will be enforced shortly.
- 1.9 -
           - Fix for Macs with case-sensitive file systems. Kudos to Jonathan Bolster.
- 1.8 -
           - Change of name to Fuskr.
           - Jonathon Bolster has put a lot of work into making Fuskr modular, and there are now a few unit tests around to make sure everything's hunky dory!
           - Fixed some issues with previous/next functionality not working when there are images missing. It also scrolls smoothly as well.
- 1.7 -
           - Added linkage below images.
- 1.6 -
           - A few bug fixes. Incognito works properly now, but only in v9 as there are some Chrome bugs outstanding.
- 1.5 -
           - Fixing a bug with the '+' icon showing up unnecessarily.
           - Galleries created in incognito mode are no longer stored.
           - Added the ability to scale images to the current window size.
           - Added some information about the current gallery (number of images and broken images).
- 1.4 -
           - Clicking a created image will jump the user to the next one. Manual fusks are a little more difficult so maybe that's one for later...
           - Added an options page! Currently the only two options are below.
           - Added recent fusks history. This allows you to keep track of and, if desired, go back to a previous one that you may have closed. This feature will only store 10 at maximum, can be disabled completely, or the history can be wiped.
           - Added an option for opening a gallery in the foreground.
- 1.3 -
           - Fixed a bug where having a nested gallery meant that the images were returned in the wrong order. - Kudos Jonathon!
           - Fixed an issue where the option appears, even when the image is not 'fusk-able' - Kudos Jonathon!
           - Fixed an issue where choosing a manual gallery and not entering a url would still try to create a new tab. Kudos Jonathon!
           - Provided an 'option' for having the new gallery show on creation, or open in the background (default is open in the foreground).
- 1.2 -
           - Fixed a bug where the horizontal scrollbar was not visible for galleries where the images were bigger than the page.
           - Added the ability to use create a gallery based on a thumbnail, which will go to the linked image instead.
- 1.1 - About 5 minutes after I released 1.0, I realised that Chrome had finally allowed extensions to create context menus, so I ripped my application apart and rebuilt it in thirty minutes to use the context menus.
- 1.0 - Initial release.


=== Feedback ===

Feedback? Gripes? Want to tell me about your last holiday? You can find me on Twitter - https://twitter.com/danbo. You can also submit support tickets to the Fuskr project on Google Code - https://github.com/DanAtkinson/Fuskr/issues
