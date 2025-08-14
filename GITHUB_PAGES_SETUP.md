# GitHub Pages Setup Instructions

Your GitHub Pages site will now automatically update with every release! Here's how it works and how to set it up.

## 🏗️ What's Been Created

### 1. Modern Website (`docs/index.html`)
- **Responsive Design**: Mobile-friendly, modern interface
- **Template Variables**: Automatically updates version, extension ID, and year
- **Professional Styling**: Clean design with proper SEO meta tags
- **Feature Showcase**: Highlights all Fuskr capabilities

### 2. Automated Workflow (`update-pages.yml`)
- **Triggers**: Automatically runs when you create version tags
- **Updates**: Replaces template variables with real data
- **Deployment**: Publishes to GitHub Pages automatically

## 🚀 Setup Process

### Step 1: Enable GitHub Pages
1. Go to your repository: `https://github.com/DanAtkinson/Fuskr`
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. This allows the workflow to deploy automatically

### Step 2: Configure Repository Settings
The workflow needs certain permissions:
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**

### Step 3: Test the Setup
You can test immediately:
1. **Manual trigger**: Go to **Actions** → **Update GitHub Pages** → **Run workflow**
2. **Or create a tag**: `git tag v5.0.2 && git push origin v5.0.2`

## 📋 How It Works

### Template System
Your `docs/index.html` contains template variables that get replaced:

```html
<!-- These get replaced automatically -->
Version {{VERSION}} 
Extension ID: {{EXTENSION_ID}}
Copyright {{YEAR}}
Install Count: {{INSTALL_COUNT}}+
```

### Automatic Updates
Every time you create a release tag:

1. **Extract Data**: Gets version from tag, extension ID from manifest
2. **Replace Variables**: Updates HTML with real values  
3. **Deploy**: Publishes to GitHub Pages
4. **Notify**: Shows success in Actions log

### URL Structure
- **Current**: `https://danatkinson.github.io/Fuskr/`
- **After Setup**: Same URL, but automatically updated content

## 🎨 Customisation Options

### Add Real Statistics
Currently uses placeholder install count. You can:
1. **Chrome Web Store API**: Fetch real installation numbers
2. **Google Analytics**: Add tracking for visitor statistics
3. **GitHub API**: Show real contributor and star counts

### Custom Domain (Optional)
To use a custom domain like `fuskr.yourdomain.com`:
1. Create `docs/CNAME` file with your domain
2. Configure DNS with your provider
3. Update workflow to create CNAME file

### Branding
- **Icons**: Already uses your extension icons
- **Colors**: Modify CSS custom properties in `docs/index.html`
- **Content**: Update text, features, and sections as needed

## 🔄 Release Process Integration

### Automatic Updates
Your existing release process now also updates the website:

```bash
# 1. Update version
npm version patch
npm run sync:version

# 2. Commit and tag  
git add .
git commit -m "Release v5.0.2"
git tag v5.0.2

# 3. Push (triggers EVERYTHING automatically)
git push origin v5.0.2
```

This single command now:
- ✅ Builds extension
- ✅ Creates GitHub release  
- ✅ Uploads to Chrome Web Store
- ✅ Updates GitHub Pages website

### Manual Website Updates
You can also update just the website:
1. Go to **Actions** → **Update GitHub Pages**
2. Click **Run workflow**
3. Optionally specify a version number

## 📊 What Gets Updated

### Version Information
- **Version Badge**: Shows current release version
- **Download Links**: Points to latest Chrome Web Store and GitHub releases
- **Copyright Year**: Always shows current year

### Extension Details
- **Extension ID**: Automatically extracted from your RSA public key
- **Chrome Web Store URL**: Direct link to your extension
- **Feature List**: Highlights all current capabilities

### Statistics (Future)
- **Install Count**: Placeholder now, can be connected to real data
- **Version History**: Could show changelog automatically
- **GitHub Stats**: Stars, forks, contributors

## 🔧 Troubleshooting

### If Pages Don't Update
1. Check **Actions** tab for any errors
2. Verify **Pages** settings use **GitHub Actions** source
3. Ensure workflow has **write** permissions

### If Template Variables Don't Replace  
1. Check the `get-extension-id.js` script runs successfully
2. Verify version extraction from Git tags
3. Look at workflow logs for sed command errors

### If Site Looks Broken
1. Check browser console for CSS/JS errors
2. Verify image paths are correct
3. Test mobile responsiveness

## 🎉 Benefits

### Professional Presence
- **Modern Design**: Clean, responsive, professional appearance
- **SEO Optimised**: Proper meta tags, Open Graph support
- **Fast Loading**: Minimal dependencies, optimised CSS

### Zero Maintenance  
- **Always Current**: Version and links update automatically
- **Consistent Branding**: Uses your extension icons and colors
- **Error-Free**: Template system prevents manual update mistakes

### Marketing Ready
- **Feature Showcase**: Highlights all capabilities clearly
- **Easy Installation**: Direct Chrome Web Store integration
- **Social Sharing**: Optimised for social media previews

Your GitHub Pages site is now enterprise-grade and fully automated! 🚀

## 📝 Next Steps

1. **Enable GitHub Pages** in repository settings
2. **Test with manual trigger** or create a test tag
3. **Customise content** in `docs/index.html` if desired
4. **Add real statistics** when Chrome Web Store API is configured

The old gh-pages branch content will be replaced with this modern, automated system!
