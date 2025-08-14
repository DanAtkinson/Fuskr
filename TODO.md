# TODO

## 🚀 Main Enhancements

- The url is being corrupted when it goes into the history. It should be base-64 encoded when storing and then base-64 encoded when retrieving.
- Add a Settings button icon on the main gallery and history pages.
- Creation of a public key for additional security. This should aid in both Chromium and Firefox add-on store submission.
- Add a "Reset Options" button to the bottom of the Options screen which deletes the options (but not history) and resets them back to their defaults.
- **Allow fusks from URL lists** - Create fusks from a list of URLs rather than sequential patterns. Example: Imgur albums where filenames are not sequential. NB: This should also be able to parse the Fuskr.txt file being loaded in.
- **Chrome Sync integration** - Make use of Chrome Sync ([chrome.storage](https://developer.chrome.com/extensions/storage) or rather the WebExtensions Storage API) to store settings and allow synchronisation across devices.
- **'Infinite' fusk mode** - Provide a single starting point and continue loading in blocks of 100 until the user requests it stops. For example, fusk url is https://www.example.com/images/5.jpg. Start by creating a range from 0 to 100 and continue going in blocks of 100 until the user stops us.
- **Advanced URL builder UI** - Change the url building UI so that we can break it into different parts and allow the user to change it as needed, rather than a simple string that gets evaluated.

## 🤔 Under Consideration

- **GUID-based URLs** - Consider moving the fusk url to inside the page. Use a guid in the url instead which is tied to the url in storage. This way, the extension can persist the request across browser restarts, and potentially browsers when used in conjunction with Chrome Sync.
