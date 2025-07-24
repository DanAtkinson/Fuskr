# TODO

## 🎯 High Priority Features
* When "Download All" is pressed, prompt the user to enter a zip filename. Default it to the timestamp.
* When in Full Width/Fill Page allow up/left or down/right keyboard to choose which image to scroll to.
* **Chrome Sync integration** - Make use of Chrome Sync ([chrome.storage](https://developer.chrome.com/extensions/storage) or rather the WebExtensions Storage API) to store settings and allow synchronisation across devices.

## 🚀 Enhanced Features
* **Allow fusks from URL lists** - Create fusks from a list of URLs rather than sequential patterns. Example: Imgur albums where filenames are not sequential.
* **'Infinite' fusk mode** - Provide a single starting point and continue loading in blocks of 100 until the user requests it stops. For example, fusk url is https://www.example.com/images/5.jpg. Start by creating a range from 0 to 100 and continue going in blocks of 100 until the user stops us.
* **Advanced URL builder UI** - Change the url building UI so that we can break it into different parts and allow the user to change it as needed, rather than a simple string that gets evaluated.

## 🎬 Mini-Projects
* **Video support** - Show videos instead of images for video URL patterns.

## 🤔 Under Consideration
* **GUID-based URLs** - Consider moving the fusk url to inside the page. Use a guid in the url instead which is tied to the url in storage. This way, the extension can persist the request across browser restarts, and potentially browsers when used in conjunction with Chrome Sync.
