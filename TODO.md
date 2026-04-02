# TODO

## 🚀 Main Enhancements

- **Allow fusks from URL lists** - Create fusks from a list of URLs rather than sequential patterns (e.g. Imgur albums with non-sequential filenames). This should also parse loaded Fuskr.txt content.
- **Advanced URL builder UI** - Split URL building into editable parts (prefix, pattern, suffix) with clearer controls rather than a single evaluated string.
- **Visual URL builder with live preview** - Show generated range/output preview while editing URL parts.
- **Chrome Sync integration** - Use WebExtensions storage sync to synchronise settings/history across devices.

## 🖼️ Gallery Experience

- **Slideshow / auto-play mode** - Cycle through images at a configurable interval with play/pause controls.
- **Image zoom and pan** - Support zooming and panning in the viewer modal, including touch gestures where available.
- **Favourites** - Mark media items in a session and filter/download favourites only.
- **Random shuffle mode** - View gallery items in random order.
- **Search within gallery** - Filter visible items by filename/URL substring.

## 🔍 Filtering and Discovery

- **Enhanced URL seed customisation** *(from from [#46](https://github.com/DanAtkinson/Fuskr/issues/46))* - Make regex/editable seed field more obvious with placeholder text, visual affordances, and help tooltips.
- **Dimension filtering** - Filter out media below configurable width/height thresholds.
- **Duplicate image detection** - Detect and hide/flag visually identical media in a gallery.

## 📥 Downloads

- **Selective ZIP download**- Let users choose which files to include before creating ZIP archives.
- **Custom filename templates** - Support naming templates such as `{pattern}-{index}.{ext}`.
- **Download queue and progress** - Show per-file progress with pause/resume controls.

## ⚙️ Settings, History, and URL Handling

- **GUID-based URLs** - Move fusk URL state into storage and use GUIDs in page URLs so galleries can be restored and shared more reliably.
- **Hash URL handling** *(from from [#36](https://github.com/DanAtkinson/Fuskr/issues/36))* - Long-term fix for hash-heavy URLs by moving fusk payload out of the address bar.
- **Export / import settings** - Backup and restore settings/history via JSON.
- **Per-site presets** - Save preferred display and loading settings by domain.
- **Pin galleries in history** - Prevent selected entries from being displaced by newer items.
- **History notes/tags** - Allow short labels for saved history entries.
- **Configurable history limit** - Make history cap user-configurable (currently fixed).

## 📚 Documentation and Marketing

- **Video tutorials** *(from from [#10](https://github.com/DanAtkinson/Fuskr/issues/10))* - Add short walkthrough videos for common fusk patterns and workflows.

## ♿ Accessibility

- **Reduced-motion mode** - Respect reduced-motion preference for transitions and animations.
- **Further screen-reader improvements** - Add aria-live announcements for loading/progress states where still missing.

## 🔧 User Experience Improvements

- **Video format support** *(from from [#4](https://github.com/DanAtkinson/Fuskr/issues/4))* - Continue extending first-class video fusking and playback support.
