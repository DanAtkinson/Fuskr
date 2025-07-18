# Fuskr - Modern Angular Extension

Fuskr is a browser extension for Chrome and Firefox that generates image galleries from URLs containing sequential patterns. This is a complete modernisation of the original project, migrating from AngularJS to Angular and replacing Grunt with modern Angular CLI build tools.

## 🚀 What's New

### Major Updates
- **Migrated from AngularJS to Angular 17** - Modern framework with better performance and TypeScript support
- **Replaced Grunt with Angular CLI** - Modern build system with webpack under the hood
- **TypeScript throughout** - Full type safety and better developer experience
- **Manifest V3** - Updated to the latest Chrome extension manifest version
- **Modern UI/UX** - Responsive design with CSS Grid and modern styling
- **Service Workers** - Background scripts now use service workers for better performance

### Technical Improvements
- **Modular Architecture** - Services and components are properly separated
- **Reactive Programming** - Uses RxJS for data flow
- **Modern CSS** - CSS Custom Properties for theming, CSS Grid for layouts
- **Testing Setup** - Jasmine and Karma configured for unit testing
- **Development Experience** - Hot reload, TypeScript, and modern tooling

## 📦 Installation

### Development Setup

1. **Use the correct Node.js version:**
   ```bash
   nvm use  # Uses version specified in .nvmrc
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Build for production:**
   ```bash
   # For Chrome (Manifest V3)
   npm run build:chromium

   # For Firefox (Manifest V2 + zip file)
   npm run build:firefox
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

### Installing as Browser Extension

#### Chrome Installation
1. Build the extension for Chrome:
   ```bash
   npm run build:chromium
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode"

4. Click "Load unpacked" and select the `dist/chromium` folder

#### Firefox Installation
1. Build the extension for Firefox:
   ```bash
   npm run build:firefox
   ```

2. **Option A - Load zip file (Recommended)**:
   - Open Firefox and navigate to `about:addons`
   - Click the gear icon and select "Install Add-on From File"
   - Select `dist/fuskr-firefox.zip`

3. **Option B - Load temporary add-on**:
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Navigate to `dist/firefox` and select the `manifest.json` file

## 🎯 Features

### Core Functionality
- **URL Pattern Recognition** - Automatically detects numeric and alphabetic patterns in URLs
- **Gallery Generation** - Creates image galleries from sequential URLs
- **Context Menu Integration** - Right-click on any image URL to create galleries
- **Omnibox Support** - Type "fuskr" in the address bar to quickly process URLs
- **Download Management** - Download individual images or entire galleries

### Modern Interface
- **Responsive Design** - Works on all screen sizes
- **Dark/Light Theme** - User-configurable themes
- **Image Lazy Loading** - Performance optimised image loading
- **Error Handling** - Graceful handling of missing images
- **Copy/Download Actions** - Quick actions for each image

### Pattern Examples
Fuskr recognises these URL patterns and automatically converts simple URLs to bracketed patterns:

**Input → Generated Pattern:**
- `https://test.com/files/3141.webp` → `https://test.com/files/31[31-51].webp` (±10 range)
- `image01.jpg` → `image[00-11].jpg` (±10 range)
- `photo001.png` → `photo[000-011].png` (±10 range)
- `imagea.jpg` → `image[a-k].jpg` (±10 range)

**Existing patterns are preserved:**
- `image[01-10].jpg` → `image[01-10].jpg` (no change)
- `photo[001-999].png` → `photo[001-999].png` (no change)
- `file[05-20].gif` → `file[05-20].gif` (no change)

## 🏗️ Architecture

### Project Structure
```
src/
├── app/
│   ├── components/          # Angular components
│   │   ├── gallery.component.ts
│   │   └── options.component.ts
│   ├── services/           # Business logic services
│   │   ├── fuskr.service.ts
│   │   └── chrome.service.ts
│   ├── app.component.ts    # Root component
│   └── app.module.ts       # App module
├── assets/                 # Static assets
├── environments/           # Environment configs
├── background.js          # Service worker
├── fuskr-core.js         # Core logic for service worker
└── manifest.json         # Extension manifest
```

### Services

#### FuskrService
Core business logic for URL pattern recognition and gallery generation:
- `isFuskable(url)` - Check if URL contains fuskable patterns
- `getLinks(url)` - Generate array of URLs from pattern
- `createFuskUrl(url, count, direction)` - Create fusk pattern from regular URL

#### ChromeService
Browser API integration:
- Storage management (sync across devices)
- Tab management
- Download functionality
- Extension context detection

### Components

#### GalleryComponent
Main interface for displaying image galleries:
- URL input and validation
- Image grid with lazy loading
- Download and copy functionality
- Error handling for missing images

#### OptionsComponent
User preferences:
- Theme selection (dark/light mode)
- Tab behaviour settings
- History management options

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run build:chromium` - Build Chrome extension package (dist/chromium/)
- `npm run build:firefox` - Build Firefox extension package + zip (dist/firefox/ + dist/fuskr-firefox.zip)
- `npm test` - Run unit tests
- `npm run watch` - Build in watch mode
- `npm run clean` - Remove all dist folders

### Build Process

The Angular CLI handles the build process with:
- **TypeScript compilation** with strict mode
- **SCSS processing** with modern CSS features
- **Asset optimisation** and copying
- **Code splitting** and tree shaking
- **Source maps** for debugging

### Extension-Specific Build

The extension build (`npm run build:extension`) creates:
- Compiled Angular application
- Service worker with core logic
- Manifest V3 configuration
- Optimised assets and icons

## 🔧 Configuration

### Angular Configuration
- `angular.json` - Angular CLI workspace configuration
- `tsconfig.json` - TypeScript compiler options
- `karma.conf.js` - Test runner configuration

### Extension Configuration
- `src/manifest.json` - Extension manifest (Manifest V3)
- `src/background.js` - Service worker
- `src/_locales/` - Internationalisation files

## 🎨 Styling

### CSS Architecture
- **CSS Custom Properties** for theming
- **CSS Grid** for responsive layouts
- **Component-scoped styles** in Angular components
- **Global utilities** in `styles.scss`

### Theme System
```css
:root {
  --primary-color: #4a90e2;
  --bg-color: #ffffff;
  --text-color: #333333;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
}
```

## 🧪 Testing

### Unit Tests
- **Jasmine** testing framework
- **Karma** test runner
- **Angular Testing Utilities**

Run tests:
```bash
npm test
```

### Test Coverage
```bash
npm run test -- --code-coverage
```

## 📱 Browser Support

- **Chrome** 88+ (Manifest V3 support)
- **Firefox** 109+ (Manifest V3 support)
- **Edge** 88+ (Chromium-based)

## 🔐 Permissions

The extension requires these permissions:
- `tabs` - Access tab information
- `downloads` - Download images
- `storage` - Save user preferences
- `contextMenus` - Context menu integration
- `activeTab` - Access current tab
- `http://*/*`, `https://*/*` - Access web content

### Content Security Policy
The extension uses Chrome's default CSP for Manifest V3, which is compatible with Angular:
- **Chrome**: Uses default Manifest V3 CSP (no explicit policy needed)
- **Firefox**: Uses relaxed CSP with `'unsafe-inline'` for styles (Manifest V2 compatible)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- **TypeScript** with strict mode
- **Angular style guide** compliance
- **ESLint** for code quality
- **Prettier** for formatting

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Original Fuskr extension by Dan Atkinson and Jonathon Bolster
- Angular team for the amazing framework
- Chrome Extensions team for Manifest V3

## 📞 Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/DanAtkinson/Fuskr/issues) page.
