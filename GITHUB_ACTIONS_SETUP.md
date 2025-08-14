# GitHub Actions Setup Guide

This guide explains how to set up automated building, testing, and deployment for the Fuskr Chrome extension.

## 🔧 Current Workflows

### 1. CI/CD Pipeline (`ci.yml`) ✅ Already configured
- **Triggers**: Push to master/main/develop, Pull Requests
- **Actions**: Testing, linting, building, coverage reports
- **Node versions**: 20.19.x, 22.12.x, 22.x
- **Artifacts**: Extension builds uploaded for 30 days

### 2. Release Pipeline (`release.yml`) ✅ Just added
- **Triggers**: Version tags (v5.0.2, v5.1.0, etc.)
- **Actions**: Build extension, create GitHub releases
- **Outputs**: ZIP files for both Chrome and Firefox

### 3. Chrome Web Store Deployment (`deploy-chrome.yml`) ✅ Just added
- **Triggers**: Version tags or manual dispatch
- **Actions**: Build and automatically upload to Chrome Web Store
- **Requires**: Chrome Web Store API credentials (see setup below)

## 🔑 Setting Up Chrome Web Store API Access

To enable automated Chrome Web Store uploads, you need to set up API access:

### Step 1: Enable Chrome Web Store API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Chrome Web Store API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Desktop application**
6. Note down your **Client ID** and **Client Secret**

### Step 2: Get Refresh Token
Run this command locally (replace with your credentials):

```bash
# Install the Chrome Web Store upload tool
npm install -g chrome-webstore-upload-cli

# Get refresh token (follow the browser prompts)
chrome-webstore-upload-cli \
  --source ./dist/fuskr-chromium.zip \
  --extension-id YOUR_EXTENSION_ID \
  --client-id YOUR_CLIENT_ID \
  --client-secret YOUR_CLIENT_SECRET \
  --auto-publish
```

This will provide you with a **refresh token**.

### Step 3: Add GitHub Secrets
In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions** and add:

```
CHROME_EXTENSION_ID=your-extension-id-from-chrome-web-store
CHROME_CLIENT_ID=your-oauth-client-id  
CHROME_CLIENT_SECRET=your-oauth-client-secret
CHROME_REFRESH_TOKEN=your-refresh-token
```

### Step 4: Find Your Extension ID
Your extension ID can be found in your `manifest.json` after converting the public key:

```bash
# Your current extension ID (derived from the RSA key in manifest.json)
# Look for the ID when you load the extension in Chrome Developer Mode
# Or use: openssl rsa -in private-key.pem -pubout -outform DER | openssl dgst -sha256 -binary | xxd -p -c 256
```

## 🚀 How to Release

### Automated Release (Recommended)
1. **Update version** in `package.json`
2. **Run sync command**: `npm run sync:version` (updates manifests)
3. **Commit changes**: `git add . && git commit -m "Release v5.0.2"`
4. **Create tag**: `git tag v5.0.2`
5. **Push tag**: `git push origin v5.0.2`

This will automatically:
- ✅ Build the extension
- ✅ Run all tests
- ✅ Upload to Chrome Web Store
- ✅ Create GitHub release with ZIP files
- ✅ Notify you of success/failure

### Manual Release
You can also trigger releases manually in the GitHub Actions tab using the **Deploy to Chrome Web Store** workflow.

## 📦 What Gets Built

### Chrome Version (`fuskr-chromium.zip`)
- Uses `manifest.json`
- Includes RSA public key for consistent extension ID
- Ready for Chrome Web Store submission
- Automated upload via GitHub Actions

### Firefox Version (`fuskr-firefox.zip`)
- Uses `manifest-firefox.json`  
- Compatible with Firefox Add-ons
- Manual submission to Mozilla required

## 🔒 Security Notes

- ✅ **Private RSA key**: Keep secure locally, never commit to Git
- ✅ **GitHub Secrets**: API credentials encrypted and secure
- ✅ **Public key**: Safe to include in source control (already done)
- ✅ **Consistent extension ID**: Ensured by RSA key in manifest

## 🎯 Benefits

1. **Fully Automated**: Tag a release, everything happens automatically
2. **Quality Assured**: All tests must pass before deployment
3. **Consistent Builds**: Same environment every time
4. **Rollback Ready**: All versions archived and downloadable
5. **Secure**: API keys encrypted, never exposed in logs
6. **Cross-Platform**: Chrome and Firefox builds generated

## 🔧 Troubleshooting

- **Build failures**: Check the Actions tab for detailed logs
- **API errors**: Verify your Chrome Web Store credentials
- **Version conflicts**: Ensure version in `package.json` is updated
- **Manifest issues**: Run `npm run sync:version` to update manifests

Your extension is now ready for professional-grade automated releases! 🎉
