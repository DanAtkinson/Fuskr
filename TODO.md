# TODO

## ✅ Completed (Migration to Angular 20.1.2)
* **Fixed Manual button functionality** - Now opens gallery page instead of deprecated prompt()
* **Fixed refresh issues** - Removed problematic base href, implemented proper hash-based routing
* **Enhanced test coverage** - Added comprehensive test suite with karma-coverage reporting
* **Protocol filtering** - Manual button only allows HTTP/HTTPS/FILE URLs, filters out browser protocols
* **URL update behavior** - Browser URL updates only on gallery generation, persists on refresh
* **Chrome extension compatibility** - Full feature parity with pre-migration AngularJS version
* **Implement overload protection** - Configurable warning system (default: 500 images) with user confirmation dialog to prevent browser crashes from large galleries

## 🎯 High Priority Features
* **Create a history page** - Contains previous results along with the number of urls generated, loaded, and broken. The current data structure doesn't have those numbers currently however. The user should be able to click a button which will open that gallery in a new tab.
* **Chrome Sync integration** - Make use of Chrome Sync ([chrome.storage](https://developer.chrome.com/extensions/storage) or rather the WebExtensions Storage API) to store settings and allow synchronisation across devices.

## 🚀 Enhanced Features
* **Allow fusks from URL lists** - Create fusks from a list of URLs rather than sequential patterns. Example: Imgur albums where filenames are not sequential.
* **'Infinite' fusk mode** - Provide a single starting point and continue loading in blocks of 100 until the user requests it stops. For example, fusk url is https://www.example.com/images/5.jpg. Start by creating a range from 0 to 100 and continue going in blocks of 100 until the user stops us.
* **Advanced URL builder UI** - Change the url building UI so that we can break it into different parts and allow the user to change it as needed, rather than a simple string that gets evaluated.

## 🎬 Mini-Projects
* **Video support** - Show videos instead of images for video URL patterns.
* **Cross-browser compatibility** - Split out Chrome-specific functionality so that we can create a Firefox/Opera version of Fuskr.

## 🤔 Under Consideration
* **GUID-based URLs** - Consider moving the fusk url to inside the page. Use a guid in the url instead which is tied to the url in storage. This way, the fusk can still persist across browser restarts, and potentially browsers when used in conjunction with Chrome Sync.
