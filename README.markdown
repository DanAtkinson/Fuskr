[![Join the chat at https://gitter.im/DanAtkinson/Fuskr](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/DanAtkinson/Fuskr?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/DanAtkinson/Fuskr.svg?branch=master)](https://travis-ci.org/DanAtkinson/Fuskr)

How to use
==========

1. Go ahead and install Fuskr from the [Google Chrome extensions gallery](https://chrome.google.com/webstore/detail/fuskr/glieaboaghdnlglpkekghloldikefofo).
1. On your desired image, right click and choose 'Fusk'.
1. Choose which direction:
   * '+/-' will return a gallery with images that come before and after it.
   * '+' will return a gallery with images that only come after it.
   * '-' will return a gallery with images that only come before it.
1. Now choose how large you want your gallery to be - 10/20/50/100/200/500 or 'Other' (you choose!).
1. Your gallery will appear in the tab next to your current one. If an image isn't returned (404 or some other error), it will be hidden from view, but you can toggle that too!


Version History
===============

* 4.0.75
  * Omnibox and history should now be working correctly again.
* 4.0.61
  * Fix issues with the context menus not working correctly in Chrome. Firefox was unaffected but the solution is cross-browser compatible.
* 4.0.20
  * Create dark mode option.
  * Tidy up code and improve some speed issues, specifically around context menu creation.
  * New version numbering. Minor version is incremented and we also include a longer version name indicating the build date/time.
* 3.2
  * Download images as a zip file and retain the structure if it's a nested fusk!
  * Options page change to support Chrome's preferred options layout.
  * Improvements to the way many urls are handled.
* 3.1
  * Fixed an issue with the fusk option not showing on links.
* 3.0
  * Application templating rewritten using [AngularJS](https://angularjs.org/).
* 2.7
  * Reduced the permissions level greatly. Previously, Fuskr required that you give us access to all websites and all browsing activity, but we only care about your current tab. Google Chrome now has that ability, so we’ve reduced the permissions needed accordingly!
  * Fixed an annoying bug where Fuskr wouldn’t work on some links that didn’t have numbers, and wouldn’t revert to the image url.
* 2.6
  * You can now download images directly from the gallery page!
  * You can now view the page in a slideshow!
  * Beginning to internationalize (l18n). If you want to help, let us know!
  * Updated to jQuery and jQuery UI.
* 2.5
  * Updated to jQuery v2.1.3 and jQuery UI 1.11.2.
* 2.4
  * Updated to jQuery v2 and jQuery UI 1.10.3.
  * Minor styling changes to the image gallery page.
* 2.3
  * Fixed some template issues and added more information and credits to the options page.
* 2.2
  * Added the ability to create a fusk by typing 'fuskr' in the omnibox, followed by your fusk url!
  * Updated libraries used by Fuskr.
* 2.1
  * Updated Fuskr with new icon/image goodness kindly provided by Richard Stelmach of Creative Binge!
* 2.0
  * Alphabetical fusking is now possible! You can now do fusks such as https://example.com/path/file/[a-z].jpg or even https://domain.com/path/file/[a-z]and[c-g]and[j-m].jpg
  * Changes to the options page to make it much cleaner.
* 1.9.1
  * Some changes to the application in order to take into account recent security update to Google Chrome which will be enforced shortly.
* 1.9
  * Fuskr wasn't working on Macs.
* 1.8
  * Change of name to Fuskr.
  * Jonathon Bolster has put a lot of work into making Fuskr modular, and there are now a few unit tests around to make sure everything's hunky dory!
  * Fixed some issues with previous/next functionality not working when there are images missing. It also scrolls smoothly as well.
* 1.7
  * Added linkage below images.
* 1.6
  * A few bug fixes. Incognito works properly now, but only in v9 as there are some Chrome bugs outstanding.
* 1.5
  * Fixing a bug with the '+' icon showing up unnecessarily.
  * Galleries created in incognito mode are no longer stored.
  * Added the ability to scale images to the current window size.
  * Added some information about the current gallery (number of images and broken images).
* 1.4
  * Clicking a created image will jump the user to the next one. Manual fusks are a little more difficult so maybe that's one for later...
  * Added an options page! Currently the only two options are below.
  * Added recent fusks history. This allows you to keep track of and, if desired, go back to a previous one that you may have closed. This feature will only store 10 at maximum, can be disabled completely, or the history can be wiped.
  * Added an option for opening a gallery in the foreground.
* 1.3
  * Fixed a bug where having a nested gallery meant that the images were returned in the wrong order. - Kudos Jonathon!
  * Fixed an issue where the ChromeFusk option appears, even when the image is not 'fusk-able' - Kudos Jonathon!
  * Fixed an issue where choosing a manual gallery and not entering a url would still try to create a new tab. Kudos Jonathon!
  * Provided an 'option' for having the new gallery show on creation, or open in the background (default is open in the foreground).
* 1.2
  * Fixed a bug where the horizontal scrollbar was not visible for galleries where the images were bigger than the page.
  * Added the ability to use create a gallery based on a thumbnail, which will go to the linked image instead.
* 1.1
  * About 5 minutes after I released 1.0, I realised that Chrome had finally allowed extensions to create context menus, so I ripped my application apart and rebuilt it in thirty minutes to use the context menus.
* 1.0
  * Initial release.
