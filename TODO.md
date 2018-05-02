# TODO

Below is a list of desirable functionality changes **in no particular order**:

1. Allow zip file names to be set.
2. Allow images to be saved individually. Currently the blob hash value is used as the filename which isn't nice. This should be as simple as adding the [`download`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#Attributes) attribute to the `<img />`.
3. Make use of Chrome Sync ([chrome.storage](https://developer.chrome.com/extensions/storage)) to store settings and allow synchronisation across devices.
4. Move fusk url to inside the page. Use a guid in the url instead which is tied to the url in storage. This way, the fusk can still persist across browser restarts, and potentially browsers when used in conjunction with Chrome Sync (see #3 above).
5. Split out Chrome-specific functionality so that we can create a Firefox/Opera? version of Fuskr.
6. Allow fusks to be created from a list of urls. A crappy example would be an Imgur album (which you can download by appending /zip to the url), where the filenames are not sequential.
