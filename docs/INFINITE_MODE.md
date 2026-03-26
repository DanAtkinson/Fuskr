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
**Status**: In Progress

Add a page action in `src/app/components/gallery.component.html`, `src/app/components/gallery.component.ts`, and `src/app/components/gallery.component.scss` that enables or disables infinite mode for the current gallery session only. This does not touch persisted options or the options page.

**Tasks**:
- [ ] Add ♾️ toggle button to gallery controls in template
- [ ] Wire `toggleInfiniteMode()` method in component (already scaffolded)
- [ ] Add styling for toggle button and visual state indicators
- [ ] Ensure toggle state stays transient (resets on new gallery generation)

**Files**:
- `src/app/components/gallery.component.html` — add toggle button and sentinels
- `src/app/components/gallery.component.ts` — wire toggle handler (scaffolded)
- `src/app/components/gallery.component.scss` — style toggle and indicators

---

### Phase 2: Gallery Sequence Tracking & Range State
**Status**: In Progress

Refactor gallery sequence tracking so the component knows the active loaded range rather than only the initial generated list. Reuse the existing pattern parsing and URL generation logic in `src/app/services/fuskr.service.ts`, but introduce explicit range/window state.

**Scaffolded State** (in `gallery.component.ts`):
- `isInfiniteMode` — toggle signal
- `infinitePatternBaseUrl` — pattern template with `__FUSKR_INFINITY__` placeholder
- `infinitePatternStart` / `infinitePatternEnd` — active numeric bounds
- `infinitePatternPadLength` — zero-padding width for URL generation
- `infinitePatternStep` — increment (default 1)
- `isLoadingBackward` / `isLoadingForward` — load-in-progress flags
- `knownMediaUrls` — Set of URLs already added (duplicate prevention)

**Tasks**:
- [ ] Verify pattern extraction in `tryInitialiseInfinitePattern()` correctly parses `[start-end]` from URL
- [ ] Test that `buildInfiniteUrl()` and `parseInfiniteNumber()` correctly round-trip values
- [ ] Ensure `knownMediaUrls` is seeded with initial gallery URLs and updated on all loads

**Files**:
- `src/app/components/gallery.component.ts` — orchestration, boundary methods, URL builders

---

### Phase 3: Bidirectional Scroll-Triggered Extension
**Status**: Planned

Add start and end sentinels or equivalent viewport-boundary detection in `src/app/components/gallery.component.html` / `src/app/components/gallery.component.ts`. When infinite mode is active and the user approaches the bottom, append the next batch; when the user approaches the top of the currently loaded range, prepend the previous batch. Preserve visible position when prepending so the gallery does not jump.

**Tasks**:
- [ ] Add start/end sentinel elements in template (e.g., divs with `#startSentinel` / `#endSentinel` refs)
- [ ] Implement IntersectionObserver in `ngOnInit()` to detect when sentinels enter viewport
- [ ] Wire observer callbacks to `maybeLoadMoreBackward()` and `maybeLoadMoreForward()` (scaffolded)
- [ ] Implement measured-height scroll restoration: measure container height before prepend, calculate new first item, then adjust scroll offset
- [ ] Guard all loads with `isInfiniteMode()` check so disabling stops further boundary loads

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
**Status**: Planned

Ensure appended and prepended items are converted into `MediaItem`s the same way as initial loads, join the existing broken-image filtering, update loaded/broken counters correctly, and participate in background MIME/type detection.

**Tasks**:
- [ ] Use `createMediaItemsFromUrls()` for both append and prepend (already scaffolded)
- [ ] Call `startProgressiveTypeDetectionForUrls()` for new batches
- [ ] Ensure broken-image callbacks work for new items (inherit from existing flow)
- [ ] Update `loadedImages` and `brokenImages` counters after each load
- [ ] Verify viewer index and focus do not shift unexpectedly

**Files**:
- `src/app/components/gallery.component.ts` — item creation, type detection hooks

---

### Phase 5: Infinite-Mode Limits & Guardrails
**Status**: Planned

Reuse the existing overload-protection concepts but adapt them for incremental loading so the feature cannot expand indefinitely without guardrails. Decide whether the cap is based on total loaded items, pattern bounds, or both.

**Decisions to Make**:
1. **Hard limit**: Maximum total items in memory (e.g. 2000 items cap; if exceeded, remove far-off items)
2. **Pattern bounds**: Stop loading once min/max pattern values are reached
3. **User feedback**: Show current loaded range in gallery stats (e.g., "Loaded: items 5–105")

**Tasks**:
- [ ] Decide on hard cap strategy (soft warn at threshold, or hard stop)
- [ ] Implement `canLoadMoreBackward()` to return false if pattern min is reached
- [ ] Implement `canLoadMoreForward()` to return false if pattern max is reached
- [ ] (Optional) Add memory-based cap: trim prepended items if total exceeds threshold

**Files**:
- `src/app/components/gallery.component.ts` — boundary checks, stats display

---

### Phase 6: Preserve Interaction Behaviour Across Range Changes
**Status**: Planned

Validate that keyboard navigation, current focused image/index, modal viewer state, and scroll restoration continue to work correctly after both prepend and append operations.

**Tests**:
- [ ] Keyboard navigation (arrow keys, Home/End) works in gallery after prepend
- [ ] Keyboard navigation works in modal viewer after prepend
- [ ] Viewer index does not shift unexpectedly when items are prepended
- [ ] Modal remains open and focused during append
- [ ] Escape closes modal after either prepend or append

**Files**:
- `src/app/components/gallery.component.ts` — navigation handlers (already robust)

---

### Phase 7: Automated Test Coverage
**Status**: Planned

Add unit tests in `src/app/components/gallery.component.spec.ts` for infinity-toggle state, range extension, duplicate prevention, prepend scroll preservation logic, and lifecycle integration. Extend `e2e/tests/gallery.spec.ts` with at least one real bidirectional infinite-scroll scenario.

**Unit Tests** (`gallery.component.spec.ts`):
- [ ] Toggle button initialises infinite mode to false
- [ ] Toggling sets `isInfiniteMode` to true, calls `tryInitialiseInfinitePattern()`
- [ ] Pattern extraction correctly parses `[start-end]` from URL
- [ ] `buildInfiniteUrl()` formats numbers correctly with padding
- [ ] `parseInfiniteNumber()` extracts numeric value from URL
- [ ] `canLoadMoreBackward()` returns false when min is reached
- [ ] `canLoadMoreForward()` returns false when max is reached
- [ ] `knownMediaUrls` prevents duplicate URLs on append
- [ ] `knownMediaUrls` prevents duplicate URLs on prepend
- [ ] Forward load appends new items, updates total correctly
- [ ] Backward load prepends new items, updates total correctly
- [ ] Prepend does not add broken URLs to view
- [ ] Disabling infinite mode stops further sentinel-triggered loads
- [ ] Generating new gallery resets infinite mode state

**E2E Tests** (`e2e/tests/gallery.spec.ts`):
- [ ] Generate gallery from pattern with room on both sides (e.g., `[05-15]` seed, extend to `[01-19]`)
- [ ] Enable infinite mode
- [ ] Scroll to bottom; verify next batch appends (no duplicates, correct order)
- [ ] Scroll to top; verify previous batch prepends (no jump, page stays readable)
- [ ] Verify viewer still works after append and prepend
- [ ] Disable infinite mode; scroll more; verify no further loads

**Files**:
- `src/app/components/gallery.component.spec.ts`
- `e2e/tests/gallery.spec.ts`

---

### Phase 8: Angular CDK Virtualisation (Follow-Up Only)
**Status**: Deferred

If performance still warrants it after infinite mode lands, prototype `cdk-virtual-scroll-viewport` only for thumbnails mode. Do not couple this to the first release.

**Tasks** (separate PR):
- [ ] Add `@angular/cdk` to `package.json`
- [ ] Wrap thumbnail gallery in `cdk-virtual-scroll-viewport`
- [ ] Benchmark memory and scroll performance vs. sentinel-based approach
- [ ] Decide whether to keep experiment or revert

---

## Relevant Files

| File | Purpose |
|------|---------|
| `src/app/components/gallery.component.ts` | Main gallery state, generation flow, counters, keyboard navigation; home for infinite-mode orchestration and scroll preservation |
| `src/app/components/gallery.component.html` | Gallery rendering loop; place to add ♾️ control and boundary sentinels |
| `src/app/components/gallery.component.scss` | Style toggle, sentinels, and visual indicators |
| `src/app/services/fuskr.service.ts` | URL pattern parsing and generation logic (reused for forward/backward batch extension) |
| `src/app/services/media-type.service.ts` | Background MIME/type detection; newly inserted items must join incrementally |
| `src/app/components/gallery.component.spec.ts` | Unit coverage for toggle state, range tracking, append/prepend behaviour |
| `e2e/tests/gallery.spec.ts` | Browser-level verification of scroll-triggered loading and position preservation |

---

## Verification Checklist

- [ ] Run `npm run test -- gallery.component.spec.ts` after implementation; all new tests pass
- [ ] Run `npm run test:e2e` for gallery e2e tests; bidirectional scroll scenario passes
- [ ] Run `npm run build` to verify no lint/format errors
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
2. **Memory management** — Decide whether prepended items should remain indefinitely or whether the gallery should eventually trim far-off items to cap memory usage in a later iteration.
3. **User feedback** — Consider surfacing the current loaded range to the user once the gallery can expand in both directions (e.g., "Loaded: items 5–105 of 500").
4. **Animation** — Consider smooth scroll restoration or brief visual feedback when new items are prepended/appended.
