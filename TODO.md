# TODO

Below is a list of desirable functionality changes **in no particular order**:

* (mini-project) Support video. This would show videos instead of images.
* Create a history page which contains the previous results along with the number of urls generated, loaded, and broken. The current data structure doesn't have those numbers currently however. The user should be able to click a button which will open that gallery in a new tab.
* (mini-project) Change the url building UI so that we can break it into different parts and allow the user to change it as needed, rather than a simple string that gets evaluated.
* Allow images to be saved individually. Currently the blob hash value is used as the filename which isn't nice. This should be as simple as adding the [`download`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#Attributes) attribute to the `<img />`.
* (low priority) Make use of Chrome Sync ([chrome.storage](https://developer.chrome.com/extensions/storage)) to store settings and allow synchronisation across devices.
* Consider moving the fusk url to inside the page. Use a guid in the url instead which is tied to the url in storage. This way, the fusk can still persist across browser restarts, and potentially browsers when used in conjunction with Chrome Sync (see #3 above).
* Split out Chrome-specific functionality so that we can create a Firefox/Opera? version of Fuskr.
* Allow fusks to be created from a list of urls. A crappy example would be an Imgur album (which you can download by appending /zip to the url), where the filenames are not sequential.
* Create 'infinite' fusk. Provide a single starting point and continue loading in blocks of 100 until the user requests it stops.
   * For example, fusk url is https://www.example.com/images/5.jpg. If they chose infinite fusk, we would start by creating a range from 0 to 100 and continue going in blocks of 100 until we reach a failure.
* Implement overload protection. If over 500 images are found, inform the user of the total generated image count.
