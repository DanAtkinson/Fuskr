# Firefox AMO Submission Checklist

This document tracks the steps required to publish Fuskr to the Firefox Add-ons (AMO) store.

## Extension Details

- **Extension ID**: `fuskr@danatkinson.com`
- **Minimum Firefox version**: 128.0 (MV3 support)
- **Manifest version**: 3

## Pre-submission Checklist

### Build

- [ ] Run `npm run build:extensions:prod` to produce a clean build
- [ ] Verify `dist/firefox/` contains a valid extension structure
- [ ] Confirm `dist/fuskr-firefox.zip` was generated
- [ ] Run `npm run build:firefox:validate` — all lint checks pass with no errors

### Manifest Verification

- [ ] `manifest_version` is `3`
- [ ] `action` key is used (not `browser_action`)
- [ ] `browser_specific_settings.gecko.id` = `fuskr@danatkinson.com`
- [ ] `browser_specific_settings.gecko.strict_min_version` = `128.0`
- [ ] `host_permissions` lists URL patterns separately from `permissions`
- [ ] `content_security_policy.extension_pages` does **not** include `'unsafe-eval'`
- [ ] `web_accessible_resources` uses MV3 object format with `resources` and `matches`

### Permissions Review

Current permissions requested: `tabs`, `downloads`, `contextMenus`, `activeTab`, `storage`

- [ ] Justify `tabs`: needed to create new gallery tabs
- [ ] Justify `downloads`: needed for zip download feature
- [ ] Justify `contextMenus`: needed for right-click Fusk menu
- [ ] Justify `activeTab`: needed to get current tab info
- [ ] Justify `storage`: needed to persist user settings and gallery history
- [ ] Justify `host_permissions` (`http://*/*`, `https://*/*`): needed to download images from arbitrary URLs

### Code Quality

- [ ] No `eval()` or `new Function()` calls in extension code
- [ ] No remote code execution patterns
- [ ] Background script (`background.js`) is self-contained
- [ ] All API calls use `chrome.*` (Firefox supports as alias for `browser.*`)

### AMO Store Listing

- [ ] Extension name: **Fuskr — Image Gallery Generator**
- [ ] Short description (max 250 chars): drafted
- [ ] Full description: adapted from README.markdown
- [ ] Screenshots: at least 1 screenshot of the gallery view
- [ ] Icons: 48×48 and 128×128 PNG provided in manifest
- [ ] Category: **Photos** or **Entertainment**
- [ ] Privacy policy: confirm PRIVACY file covers AMO requirements
- [ ] Support URL: `https://github.com/DanAtkinson/Fuskr/issues`
- [ ] Homepage URL: `https://github.com/DanAtkinson/Fuskr`

### Source Code Submission

AMO requires source code if the extension uses a build system.

- [ ] Prepare a `fuskr-source.zip` containing the full repo (excluding `node_modules/`, `dist/`)
- [ ] Include `BUILD.md` or update `DEVELOPER.md` with exact build instructions:
  ```
  npm ci
  npm run build:extensions
  # Output: dist/fuskr-firefox.zip
  ```
- [ ] Verify the build is reproducible from the submitted source

### Review Notes for AMO Reviewer

Include the following notes during submission:

> Fuskr is an image gallery generator that creates sequential galleries from a single URL.
> It uses Manifest V3 with a service-worker-style background script compiled via webpack.
> Source code is available at https://github.com/DanAtkinson/Fuskr.
> Build instructions: run `npm ci && npm run build:extensions:prod` to reproduce the Firefox ZIP.
> The extension requires broad host permissions (`http://*/*`, `https://*/*`) because it must
> download images from user-specified URLs on arbitrary domains.

## Post-submission

- [ ] Receive AMO approval email
- [ ] Update README.markdown with the Firefox AMO badge and install link
- [ ] Tag the release in git

## Known Issues / TODO

- The background script currently uses `chrome.*` APIs directly. Firefox supports these
  as a compatibility alias for `browser.*`. A future improvement is to migrate to
  `webextension-polyfill` for promise-based cross-browser API calls.
- The `End` key navigation is broken (see issue #94) — do not mention as a feature.
