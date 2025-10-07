Fuskr — create instant image galleries from numbered URLs

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

New in 5.x
- Modern Angular rewrite with performance and UI improvements
- “Open in tab” button on image cards
- Smarter download-all ZIP with stable duplicate naming (image (0002).jpg), plus manifest and metadata
- Faster large downloads: automatically avoids unnecessary recompression for big sets
- Auto-remove broken images (persistently or just for the current session)
- Improved options page and better scaling at high DPI

Privacy
- Fuskr runs in your browser and only needs access to the current tab when you use it.
- No tracking, no analytics. You’re in control.

Notes
- Works with Chrome, Edge, and other Chromium-based browsers. A Firefox build is also available on GitHub releases.
- For advanced patterns (including nested or alphabetic ranges), try bracket syntax like [001-250] or [a-z].

Support and feedback
- Issues, ideas, or help translating? Open an issue: https://github.com/DanAtkinson/Fuskr/issues
- Follow updates and releases on GitHub.

Version history (highlights)
- 5.x — Angular upgrade, performance boosts, improved downloads, UI scaling fixes, session-based broken-image removal
- 4.x — Omnibox support, dark mode, options and history fixes
- 3.x — Zip downloads, nested fusks, improved handling of many URLs
- 2.x — Alphabetical fusking, reduced permissions, slideshow, direct downloads
- 1.x — Initial releases and early Chrome context menu support