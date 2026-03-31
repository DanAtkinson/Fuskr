# Infinite Gallery Mode Implementation Plan

## Overview

Add an opt-in infinite gallery mode controlled from the gallery page via a ♾️ button, where the gallery can extend in both directions as the user approaches either end of the current sequence window. The recommended approach is to implement this on top of the existing gallery architecture without persistence for the first release, and to treat Angular CDK virtualisation as a separate later experiment rather than part of the initial delivery.

## Architecture Decisions

- **Included scope**: Bidirectional infinite loading controlled by a transient gallery-page toggle (session-only, no persistence).
- **Excluded from first release**: Persisted settings/options UI for infinite mode.
- **Excluded from first release**: Angular CDK virtualisation and any package/dependency changes for it.
- **Architecture approach**: Use sentinel-based incremental loading on the existing layout first because it directly delivers the feature with lower risk than a rendering-system refactor.

## Implementation Phases

### Phase 1: Transient Gallery-Level Infinity Toggle
**Status**: Completed

Add a page action in `src/app/components/gallery.component.html`, `src/app/components/gallery.component.ts`, and `src/app/components/gallery.component.scss` that enables or disables infinite mode for the current gallery session only. This does not touch persisted options or the options page.

**Tasks**:
- [x] Add ♾️ toggle button to gallery controls in template
- [x] Wire `toggleInfiniteMode()` method in component
- [x] Add styling for toggle button and visual state indicators
- [x] Ensure toggle state stays transient (resets on new gallery generation)

**Files**:
- `src/app/components/gallery.component.html` — add toggle button and sentinels
- `src/app/components/gallery.component.ts` — wire toggle handler
- `src/app/components/gallery.component.scss` — style toggle and indicators

---

### Phase 2: Gallery Sequence Tracking & Range State
**Status**: Completed

Refactor gallery sequence tracking so the component knows the active loaded range rather than only the initial generated list. Reuse the existing pattern parsing and URL generation logic in `src/app/services/fuskr.service.ts`, but introduce explicit range/window state.

**Scaffolded State** (in `gallery.component.ts`):
- `isInfiniteMode` — toggle signal
- `infinitePatternBaseUrl` — pattern template with `__FUSKR_INFINITY__` placeholder
- `infinitePatternPadLength` — zero-padding width for URL generation
- `infinitePatternStep` — increment (default 1)
- `isLoadingBackward` / `isLoadingForward` — load-in-progress flags
- `knownMediaUrls` — Set of URLs already added (duplicate prevention)

**Tasks**:
- [x] Verify pattern extraction in `tryInitialiseInfinitePattern()` correctly parses `[start-end]` from URL
- [x] Test that `buildInfiniteUrl()` and `parseInfiniteNumber()` correctly round-trip values
- [x] Ensure `knownMediaUrls` is seeded with initial gallery URLs and updated on all loads

**Files**:
- `src/app/components/gallery.component.ts` — orchestration, boundary methods, URL builders

---

### Phase 3: Bidirectional Scroll-Triggered Extension
**Status**: Completed

Add start and end sentinels or equivalent viewport-boundary detection in `src/app/components/gallery.component.html` / `src/app/components/gallery.component.ts`. When infinite mode is active and the user approaches the bottom, append the next batch; when the user approaches the top of the currently loaded range, prepend the previous batch. Preserve visible position when prepending so the gallery does not jump.

**Tasks**:
- [x] Add start/end sentinel elements in template
- [x] Implement `IntersectionObserver`-based boundary detection
- [x] Wire observer callbacks to `maybeLoadMoreBackward()` and `maybeLoadMoreForward()`
- [x] Implement measured-height scroll restoration on prepend
- [x] Guard all loads with `isInfiniteMode()` checks so disabling stops boundary loads
- [x] Add viewport-edge fallback checks to improve reliability when sentinel intersections are missed

**Scroll Preservation Algorithm**:
```
Before prepend:
  - Store firstItemElement reference and window.scrollY
  - Measure container height (all currently visible items)

After prepend:
  - Calculate new position: scrollY + (newFirstItem.offsetHeight * itemsPrepended)
  - Scroll to calculated position without jump
```

**Files**:
- `src/app/components/gallery.component.html` — sentinels, refs
- `src/app/components/gallery.component.ts` — observer setup, scroll logic

---

### Phase 4: Incremental Load Integration with Lifecycle
**Status**: Completed

Ensure appended and prepended items are converted into `MediaItem`s the same way as initial loads, join the existing broken-image filtering, update loaded/broken counters correctly, and participate in background MIME/type detection.

**Tasks**:
- [x] Use `createMediaItemsFromUrls()` for both append and prepend
- [x] Call `startProgressiveTypeDetectionForUrls()` for new batches
- [x] Ensure broken-image callbacks work for new items
- [x] Update `loadedImages` and `brokenImages` counters after each load
- [x] Verify viewer index/focus behaviour in modal navigation paths while loading more items

**Files**:
- `src/app/components/gallery.component.ts` — item creation, type detection hooks

---

### Phase 5: Infinite-Mode Limits & Guardrails
**Status**: Completed

Reuse the existing overload-protection concepts but adapt them for incremental loading so the feature cannot expand indefinitely without guardrails. Decide whether the cap is based on total loaded items, pattern bounds, or both.

**Decisions to Make**:
1. **Hard limit**: Maximum total items in memory (e.g. 2000 items cap; if exceeded, remove far-off items)
2. **Pattern bounds**: Continue beyond initial bracket range; stop only on lower bound (`0`) and hard cap
3. **User feedback**: Show current loaded range in gallery stats (e.g., "range 005-105")

**Tasks**:
- [x] Decide on hard cap strategy (hard stop at `infiniteMaxItems`)
- [x] Implement `canLoadMoreBackward()` lower-bound checks
- [x] Implement `canLoadMoreForward()` continuation checks for uncapped forward loading
- [x] Add progressive continuation prompts for broken edges (`10`, `50`, `100`, then no further prompts)
- [x] Add user-facing loaded range stat while infinite mode is enabled
- [ ] (Optional, deferred) Add memory-based cap to trim older off-screen items when total loaded items exceed a threshold during very long sessions

**Files**:
- `src/app/components/gallery.component.ts` — boundary checks, stats display

---

### Phase 6: Preserve Interaction Behaviour Across Range Changes
**Status**: Completed

Validate that keyboard navigation, current focused image/index, modal viewer state, and scroll restoration continue to work correctly after both prepend and append operations.

**Tests**:
- [x] Keyboard navigation (arrow keys, Home/End) works in gallery after prepend/append
- [x] Keyboard navigation works in modal viewer during infinite loading
- [x] Viewer index advances correctly when loading is triggered near either edge
- [x] Modal remains open and focused during append/prepend-triggered navigation
- [x] Escape closes modal after append/prepend states

**Files**:
- `src/app/components/gallery.component.ts` — navigation handlers (already robust)

---

### Phase 7: Automated Test Coverage
**Status**: Completed

Add unit tests in `src/app/components/gallery.component.spec.ts` for infinity-toggle state, range extension, duplicate prevention, prepend scroll preservation logic, and lifecycle integration. Extend `e2e/tests/gallery.spec.ts` with at least one real bidirectional infinite-scroll scenario.

**Unit Tests** (`gallery.component.spec.ts`):
- [x] Toggle button initialises infinite mode to false
- [x] Toggling sets `isInfiniteMode` to true, calls `tryInitialiseInfinitePattern()`
- [x] Pattern extraction correctly parses bracketed ranges
- [x] `buildInfiniteUrl()` formats numbers correctly with padding
- [x] `parseInfiniteNumber()` extracts numeric values from matching URLs
- [x] Duplicate prevention via `knownMediaUrls` for infinite batches
- [x] Forward loading can continue beyond initial bracket end
- [x] Continuation guard prompts and threshold escalation behaviour
- [x] Modal viewer near-edge navigation triggers incremental loads
- [x] Viewer count reflects visible-vs-total semantics when broken items are hidden/shown
- [x] Loaded-range stat helper returns expected values
- [x] Generating a new gallery resets infinite mode session state

**E2E Tests** (`e2e/tests/gallery.spec.ts`):
- [x] Enable infinite mode on gallery page
- [x] Scroll down and verify append beyond initial generated range
- [x] Add explicit upward/prepend e2e validation
- [x] Add explicit viewer-behaviour e2e validation during infinite loading
- [x] Add explicit disable-and-stop-loading e2e validation

**Files**:
- `src/app/components/gallery.component.spec.ts`
- `e2e/tests/gallery.spec.ts`

---

### Phase 8: Angular CDK Virtualisation (Follow-Up Only)
**Status**: In Progress

If performance still warrants it after infinite mode lands, prototype `cdk-virtual-scroll-viewport` only for thumbnails mode. Do not couple this to the first release.

**Tasks** (separate PR):
- [x] Add `@angular/cdk` to `package.json`
- [x] Wrap thumbnail gallery in `cdk-virtual-scroll-viewport`
- [x] Keep the first prototype scoped to thumbnails mode with infinite mode continuing to use the existing non-virtualised gallery path
- [x] Add automated Playwright comparison of virtual-thumbnail rendered DOM count and scrollability vs. the non-virtual thumbnail fallback
- [ ] Record manual memory and scroll performance measurements across large galleries/browsers
- [ ] Decide whether to keep experiment or revert

**E2E Tests** (`e2e/tests/gallery.spec.ts`):
- [x] Add large-gallery thumbnail virtualisation comparison test (virtual DOM count remains below total item count, fallback path renders full count)

**Files**:
- `src/app/components/gallery.component.ts`
- `src/app/components/gallery.component.html`
- `src/app/components/gallery.component.scss`
- `src/app/components/gallery.component.spec.ts`
- `e2e/tests/gallery.spec.ts`

---

## Relevant Files

| File | Purpose |
|------|---------|
| `src/app/components/gallery.component.ts` | Main gallery state, generation flow, counters, keyboard navigation; home for infinite-mode orchestration and thumbnail virtualisation logic |
| `src/app/components/gallery.component.html` | Gallery rendering loop; contains both the standard gallery path and the thumbnail virtual-scroll branch |
| `src/app/components/gallery.component.scss` | Style toggle, sentinels, visual indicators, and virtual-thumbnail viewport layout |
| `src/app/services/fuskr.service.ts` | URL pattern parsing and generation logic (reused for forward/backward batch extension) |
| `src/app/services/media-type.service.ts` | Background MIME/type detection; newly inserted items must join incrementally |
| `src/app/components/gallery.component.spec.ts` | Unit coverage for toggle state, range tracking, append/prepend behaviour, and thumbnail virtualisation |
| `e2e/tests/gallery.spec.ts` | Browser-level verification of infinite loading and thumbnail virtualisation/fallback behaviour |

---

## Verification Checklist

- [x] Run gallery unit tests; infinite-mode tests pass
- [x] Run `npm run test:coverage`; coverage and thresholds remain healthy
- [x] Run targeted gallery e2e (`chromium-extension`) for infinite append flow
- [x] Run targeted gallery e2e for thumbnail virtualisation benchmark/comparison flow
- [x] Run `npm run build` to verify lint/test/build health
- [ ] Manually test: Generate gallery from sequence with room on both sides
- [ ] Manually test: Enable infinite mode, scroll downward to trigger append
- [ ] Manually test: Scroll upward to trigger prepend
- [ ] Manually test: Verify no duplicate URLs and no disruptive scroll jumps
- [ ] Manually test: Verify broken-image handling works after prepend/append
- [ ] Manually test: Verify keyboard navigation works after prepend/append
- [ ] Manually test: Verify modal viewer state is preserved
- [ ] Manually test: Disable infinite mode and verify scroll stops triggering loads

---

## Further Considerations

1. **Batch size tuning** — Currently `INFINITE_BATCH_SIZE = 50`. Consider whether this should match initial progressive chunking or be tuned separately for scroll responsiveness.
2. **Memory management** — Decide whether items added at the top should remain indefinitely or whether the gallery should eventually trim far-off items to cap memory usage in a later iteration.
3. **User feedback** — Consider surfacing the current loaded range to the user once the gallery can expand in both directions (e.g., "Loaded: items 5-105 of 500").
4. **Animation** — Consider smooth scroll restoration or brief visual feedback when items are added at the top or bottom.
