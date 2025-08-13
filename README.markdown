# 🖼️ Fuskr - Image Gallery Generator

[![CI/CD Pipeline](https://github.com/DanAtkinson/Fuskr/actions/workflows/ci.yml/badge.svg)](https://github.com/DanAtkinson/Fuskr/actions/workflows/ci.yml)
![Chrome](https://img.shields.io/badge/Chrome-88+-green.svg)
![Firefox](https://img.shields.io/badge/Firefox-109+-orange.svg)
![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)

> **✨ Complete Angular 20.1.2 Rewrite with TypeScript & Manifest V3 ✨**
>
> Transform single image URLs into stunning galleries with intelligent pattern recognition!

## 🚀 Quick Start Guide

### Option 1: Right-Click Context Menu
1. **Right-click** on any image with a numbered URL
2. **Select "Fusk"** from the context menu  
3. **Choose direction**:
   - `+/-` - Images before and after the current one
   - `+` - Only images that come after  
   - `-` - Only images that come before
4. **Pick gallery size** - 10/20/50/100/200/500 or custom amount
5. **Enjoy your gallery!** Opens in a new tab with full navigation

### Option 2: Address Bar (Omnibox)
1. Type `fuskr` in your browser's address bar
2. Press **Tab** or **Space**  
3. **Paste your image URL** and press Enter
4. Gallery opens automatically!

### 🎮 Navigation Controls
- **Arrow Keys** - Previous/Next image
- **Page Up/Down** - Jump by 10 images
- **Home/End** - First/Last image  
- **Number Keys** - Jump to specific image
- **Escape** - Close gallery
- **Mouse** - Click thumbnails or use scroll wheel

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

## 📦 Installation

### Installing as Browser Extension

#### Chrome Installation
1. Download the extension files or build from source (see [DEVELOPER.md](DEVELOPER.md))
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder

#### Firefox Installation
1. Download the extension files or build from source (see [DEVELOPER.md](DEVELOPER.md))
2. Open Firefox and navigate to `about:addons`
3. Click the gear icon and select "Install Add-on From File"
4. Select the extension zip file

## 📱 Browser Support

- **Chrome** 88+ (Manifest V3 support)
- **Firefox** 109+ (Manifest V3 support)
- **Edge** 88+ (Chromium-based)

## 🛠️ Development

For developers who want to build, modify, or contribute to Fuskr, please see [DEVELOPER.md](DEVELOPER.md) for detailed setup instructions, architecture information, and contribution guidelines.

## 📋 Version History

**Current Version: 5.0.0** - Complete Angular 20.1.2 rewrite with TypeScript & Manifest V3

🔗 **[View Complete Version History](HISTORY.md)** - See detailed changelog from v1.0 to v5.0.0

---

## 💻 Developer Resources

- 🛠️ **[Developer Guide](DEVELOPER.md)** - Setup, architecture, and contribution guidelines  
- 📚 **[Version History](HISTORY.md)** - Complete changelog with all versions
- 🧪 **Testing** - 223 passing unit tests with comprehensive coverage
- 🔧 **Build System** - Modern webpack-based build process

## 🤝 Contributing

We welcome contributions! Please see our [DEVELOPER.md](DEVELOPER.md) for:
- Development setup instructions
- Code architecture overview  
- Testing guidelines
- Contribution workflow

## 📄 Licence

This project is licenced under the MIT Licence - see the [LICENCE](LICENCE) file for details.
