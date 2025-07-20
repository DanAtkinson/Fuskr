# ChromeStorageData Restructuring Update Script

This document outlines the changes needed to update the options template for the new structured ChromeStorageData.

## Template Updates Needed:

1. `options.darkMode` → `options.display!.darkMode`
2. `options.imageDisplayMode` → `options.display!.imageDisplayMode`
3. `options.showImagesInViewer` → `options.display!.showImagesInViewer`
4. `options.toggleBrokenImages` → `options.display!.toggleBrokenImages`
5. `options.openInForeground` → `options.behavior!.openInForeground`
6. `options.keepRecentFusks` → `options.behavior!.keepRecentFusks`
7. `options.enableOverloadProtection` → `options.safety!.enableOverloadProtection`
8. `options.overloadProtectionLimit` → `options.safety!.overloadProtectionLimit`

These changes need to be applied to:
- src/app/components/options.component.html (multiple ngModel bindings)
- All test files that reference these properties
