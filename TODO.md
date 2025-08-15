# TODO

## 🚀 Main Enhancements

- **Allow fusks from URL lists** - Create fusks from a list of URLs rather than sequential patterns. Example: Imgur albums where filenames are not sequential. NB: This should also be able to parse the Fuskr.txt file being loaded in.
- **Individual image downloads** *(from #45)* - Option to download images separately instead of ZIP files. Include image selection UI, bulk download options, and preserve original filenames. Many users prefer individual files over ZIP archives.
- **Keyboard shortcuts** *(from #38)* - Programmable keyboard shortcuts for common actions. Allow users to configure custom shortcuts for different fusk directions (+/-), counts (10/20/50), and auto-download options.
- **Chrome Sync integration** - Make use of Chrome Sync ([chrome.storage](https://developer.chrome.com/extensions/storage) or rather the WebExtensions Storage API) to store settings and allow synchronisation across devices.
- **'Infinite' fusk mode** - Provide a single starting point and continue loading in blocks of 100 until the user requests it stops. For example, fusk url is https://www.example.com/images/5.jpg. Start by creating a range from 0 to 100 and continue going in blocks of 100 until the user stops us.
- **Advanced URL builder UI** - Change the url building UI so that we can break it into different parts and allow the user to change it as needed, rather than a simple string that gets evaluated.

## 🔧 User Experience Improvements

- **Enhanced URL seed customisation** *(from #46)* - Make the regex field in gallery pages more visually obvious as editable. Add visual indicators, placeholder text, and help tooltips for users to customise URL patterns.
- **Video format support** *(from #4)* - Extend beyond images to support video fusks. Implement HTML5 video with Flash fallback for comprehensive format support. Detect MIME types automatically.
- **Improved image saving** *(from #35)* - Fix individual image saving to preserve original filenames instead of blob GUIDs. Enhance right-click save functionality.

## 🚨 Priority Fixes

- **Firefox extension signing** *(from #91)* - Address Firefox installation issues with unsigned extensions. Either submit to Mozilla Add-ons or provide proper self-distribution documentation.
- **Incognito mode support** *(from #42)* - Ensure context menus work properly in incognito/private browsing modes across all browsers.

## 📚 Documentation & Marketing

- **Complete help page** *(from #11)* - Build comprehensive help with examples covering default patterns, complex patterns, and alphabetical sequences.
- **Video tutorials** *(from #10)* - Create YouTube tutorial videos showing different fusk types and use cases for the help page and extension store listing.

## 🤔 Under Consideration

- **GUID-based URLs** - Consider moving the fusk url to inside the page. Use a guid in the url instead which is tied to the url in storage. This way, the extension can persist the request across browser restarts, and potentially browsers when used in conjunction with Chrome Sync.
- **Hash URL handling** *(from #36)* - Long-term solution for URLs containing hashes by moving fusk URLs out of the address bar and into the page itself.
