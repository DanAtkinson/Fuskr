# Fuskr - Developer Documentation

This document contains technical information for developers who want to build, modify, or contribute to Fuskr.

## 🚀 Development Setup

### Prerequisites

1. **Node.js** - Use the version specified in `.nvmrc`:
   ```bash
   nvm use  # Uses version specified in .nvmrc
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Development Commands

- `npm start` - Start development server with hot reload
- `npm run build` - Full production build with tests and packaging
- `npm run build:extensions` - Build extensions without running tests
- `npm run build:angular` - Build Angular application only
- `npm run build:background` - Build service worker only
- `npm test` - Run unit tests
- `npm run test:ci` - Run tests in CI mode (single run, no watch)
- `npm run test:coverage` - Run tests with coverage report
- `npm run watch` - Build in watch mode for development
- `npm run clean` - Remove all dist folders
- `npm run sync:version` - Sync version from package.json to manifests

### Build Process

The build system creates optimised packages for both Chrome and Firefox:

```bash
npm run build
```

This will:
1. Clean previous builds
2. Sync version numbers across manifest files
3. Run all tests
4. Build Angular application for both browsers
5. Build service worker with core logic
6. Copy localisation files and manifests
7. Organise files into proper structure
8. Create zip files for distribution

#### Output Structure
```
dist/
├── chromium/              # Chrome extension (Manifest V3)
│   ├── assets/
│   ├── js/
│   ├── _locales/
│   └── manifest.json
├── firefox/               # Firefox extension (Manifest V2)
│   ├── assets/
│   ├── js/
│   ├── _locales/
│   └── manifest.json
├── fuskr-chromium.zip    # Chrome package
└── fuskr-firefox.zip     # Firefox package
```

## 🏗️ Architecture

### Project Structure
```
src/
├── app/
│   ├── components/            # Angular components
│   │   ├── gallery.component.ts
│   │   ├── history.component.ts
│   │   ├── options.component.ts
│   │   └── base.component.ts
│   ├── services/              # Business logic services
│   │   ├── fuskr.service.ts   # Core fusk logic
│   │   ├── chrome.service.ts  # Browser API integration
│   │   ├── logger.service.ts  # Logging and debugging
│   │   └── media-type.service.ts # Media detection
│   ├── interfaces/            # TypeScript interfaces
│   │   ├── chrome-storage/    # Storage-related interfaces
│   │   ├── gallery-history/   # History interfaces
│   │   └── media/             # Media-related interfaces
│   ├── models/                # Data models
│   │   └── chrome-storage/    # Storage model implementations
│   ├── app.component.ts       # Root component
│   ├── app.module.ts          # App module
│   └── app-routing.module.ts  # Routing configuration
├── build/                     # Build scripts
│   ├── organise-build.js      # File organisation
│   ├── zip-build.js           # Package creation
│   └── sync-version.js        # Version synchronisation
├── config/                    # Build configuration
│   ├── webpack.background.js  # Service worker build
│   ├── webpack.config.js      # Main webpack config
│   └── karma.conf.js          # Test configuration
├── assets/                    # Static assets
├── environments/              # Environment configs
├── background.ts              # Service worker (TypeScript)
├── fuskr-core.ts              # Core logic for service worker
├── manifest.json              # Chrome manifest (V3)
├── manifest-firefox.json     # Firefox manifest (V2)
└── _locales/                  # Internationalisation files
```

### Key Services

#### FuskrService
Core business logic for URL pattern recognition and gallery generation:

**Key Methods:**
- `isFuskable(url: string): boolean` - Check if URL contains fuskable patterns
- `getLinks(url: string): string[]` - Generate array of URLs from pattern
- `createFuskUrl(url: string, count: number, direction: number): string` - Create fusk pattern from regular URL

**Pattern Recognition:**
- Numeric patterns: `image01.jpg` → `image[00-11].jpg`
- Alphabetic patterns: `imagea.jpg` → `image[a-k].jpg`  
- Complex patterns: `file001x999.png` → `file[000-011]x[989-999].png`

#### ChromeService
Browser API integration and extension functionality:

**Storage Management:**
- `loadOptions(): Promise<ChromeStorageData>` - Load user preferences
- `saveOptions(options: ChromeStorageData): Promise<void>` - Save user preferences
- `resetOptions(): Promise<void>` - Reset to defaults

**Tab and Download Management:**
- `openTab(url: string): Promise<void>` - Open URLs in new tabs
- `downloadImage(url: string, filename: string): Promise<void>` - Download images

#### LoggerService
Comprehensive logging system for debugging:

**Features:**
- Multiple log levels (DEBUG, INFO, WARN, ERROR)
- Log persistence and export
- Configurable log limits
- Context-aware logging

#### MediaTypeService
Media detection and type resolution:

**Capabilities:**
- Image format detection
- Video format support
- URL validation
- MIME type resolution

### Components

#### GalleryComponent
Main interface for displaying image galleries:

**Features:**
- URL input and validation with pattern preview
- Responsive image grid with lazy loading
- Keyboard navigation (arrows, page keys, numbers)
- Download and copy functionality
- Error handling for missing images
- Progress tracking and overload protection

#### OptionsComponent
User preferences management:

**Settings:**
- Theme selection (dark/light mode)
- Tab behaviour (foreground/background)
- History management options
- Safety settings and limits
- Display preferences

#### HistoryComponent
Gallery history management:

**Features:**
- Recent gallery history display
- History search and filtering
- Batch operations (clear, export)
- History persistence across sessions

## 🧪 Testing

### Test Setup
- **Framework:** Jasmine with Karma runner
- **Coverage:** Istanbul for code coverage reports
- **Angular Testing:** Angular Testing Utilities for component testing

### Test Commands
```bash
npm test              # Watch mode for development
npm run test:ci       # Single run for CI/CD
npm run test:coverage # Generate coverage reports
```

### Test Structure
```
src/app/
├── components/
│   ├── gallery.component.spec.ts
│   ├── options.component.spec.ts
│   └── base.component.spec.ts
├── services/
│   ├── fuskr.service.spec.ts
│   ├── chrome.service.spec.ts
│   └── logger.service.spec.ts
└── models/
    └── chrome-storage.model.spec.ts
```

### Test Coverage Goals
- **Statements:** >80%
- **Branches:** >75%
- **Functions:** >80%
- **Lines:** >80%

## 🎨 Styling Architecture

### CSS Organisation
- **Global Styles:** `src/styles.scss` - Global utilities and theme variables
- **Component Styles:** Scoped styles in `.component.scss` files
- **Theme System:** CSS Custom Properties for consistent theming

### Theme System
```css
:root {
  --primary-color: #4a90e2;
  --secondary-color: #7b68ee;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  
  --bg-color: #ffffff;
  --surface-color: #f8f9fa;
  --text-color: #333333;
  --text-muted: #6c757d;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --surface-color: #2d2d2d;
  --text-color: #e0e0e0;
  --text-muted: #a0a0a0;
}
```

### Responsive Design
- **CSS Grid** for gallery layouts
- **Flexbox** for component layouts
- **Media queries** for mobile optimisation
- **Container queries** for component-level responsiveness

## 🔧 Configuration Files

### TypeScript Configuration
- `tsconfig.json` - Main TypeScript configuration with strict mode
- `tsconfig.app.json` - Application-specific TypeScript settings
- `tsconfig.spec.json` - Test-specific TypeScript settings

### Angular Configuration
- `angular.json` - Angular CLI workspace configuration
- `src/environments/` - Environment-specific configurations

### Build Configuration
- `src/config/webpack.background.js` - Service worker build configuration
- `src/config/karma.conf.js` - Test runner configuration

### Extension Configuration
- `src/manifest.json` - Chrome extension manifest (Manifest V3)
- `src/manifest-firefox.json` - Firefox extension manifest (Manifest V2)
- `src/_locales/en_GB/messages.json` - Internationalisation strings

## 🔐 Security and Permissions

### Required Permissions
```json
{
  "permissions": [
    "tabs",           // Access tab information
    "downloads",      // Download images
    "storage",        // Save user preferences  
    "contextMenus",   // Context menu integration
    "activeTab"       // Access current tab
  ],
  "host_permissions": [
    "http://*/*",     // Access HTTP content
    "https://*/*"    // Access HTTPS content
  ]
}
```

### Content Security Policy
- **Chrome (V3):** Uses default Manifest V3 CSP (no explicit policy needed)
- **Firefox (V2):** Uses relaxed CSP with `'unsafe-inline'` for styles

### Privacy Considerations
- No data collection or external analytics
- All processing happens locally
- User preferences stored in browser sync storage
- No network requests except for image loading

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/your-feature-name`
4. **Install** dependencies: `npm install`
5. **Make** your changes with tests
6. **Run** tests: `npm test`
7. **Build** to ensure everything works: `npm run build`
8. **Commit** your changes: `git commit -m "Add your feature"`
9. **Push** to your fork: `git push origin feature/your-feature-name`
10. **Create** a pull request

### Code Style Guidelines
- **TypeScript** with strict mode enabled
- **Angular Style Guide** compliance
- **ESLint** for code quality (if configured)
- **Prettier** for consistent formatting
- **JSDoc** comments for public APIs
- **British English** spelling in comments and documentation

### Commit Message Format
```
type(scope): brief description

Optional longer description explaining the change.

Fixes #issue-number
```

**Types:** feat, fix, docs, style, refactor, test, chore

### Pull Request Checklist
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Code follows style guidelines
- [ ] Documentation updated if needed
- [ ] Commit messages follow format
- [ ] No breaking changes (or documented)

## 📈 Performance Considerations

### Bundle Optimisation
- **Tree Shaking** - Unused code elimination
- **Code Splitting** - Lazy loading where appropriate
- **Asset Optimisation** - Image and file size optimisation

### Runtime Performance
- **Lazy Loading** - Images loaded on demand
- **Virtual Scrolling** - For large galleries
- **Memory Management** - Proper cleanup and disposal
- **Efficient Rendering** - OnPush change detection where possible

### Extension-Specific Optimisations
- **Service Worker** efficiency for background tasks
- **Storage** optimisation for user preferences
- **Context Menu** performance for large lists
- **Tab Management** to avoid memory leaks

## 🐛 Debugging

### Development Tools
- **Angular DevTools** browser extension
- **Chrome Extension DevTools** for extension debugging
- **Logger Service** with configurable levels
- **Source Maps** for TypeScript debugging

### Common Issues and Solutions

#### Service Worker Issues
- **Problem:** Service worker not updating
- **Solution:** Check `chrome://extensions/` and reload extension

#### Build Issues  
- **Problem:** Build fails with TypeScript errors
- **Solution:** Run `npm run clean` and rebuild

#### Test Issues
- **Problem:** Tests fail in headless mode
- **Solution:** Check `karma.conf.js` browser configuration

### Logging and Monitoring
```typescript
// Use LoggerService for consistent logging
constructor(private logger: LoggerService) {}

this.logger.info('Operation started', { context: 'data' });
this.logger.error('Operation failed', error);
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- **Angular Team** - For the excellent framework and tooling
- **Chrome Extensions Team** - For Manifest V3 and comprehensive APIs
- **TypeScript Team** - For type safety and developer experience
- **Open Source Community** - For the countless libraries and tools used

---

For user-focused documentation, see [README.markdown](README.markdown).
