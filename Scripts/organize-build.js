#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Simple Node.js script to organise Angular build output into clean directory structure
 * This is much more maintainable than PowerShell and works cross-platform
 */

const distPath = process.argv[2] || 'dist/chromium';

console.log(`Organising build output in: ${distPath}`);

// Create directories
const dirs = ['js', 'css'];
dirs.forEach(dir => {
	const dirPath = path.join(distPath, dir);
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`Created directory: ${dir}/`);
	}
});

// Move files
const files = fs.readdirSync(distPath);

files.forEach(file => {
	const filePath = path.join(distPath, file);
	const stat = fs.statSync(filePath);

	if (stat.isFile()) {
		let targetDir = null;

		// Move JavaScript files
		if (file.endsWith('.js')) {
			targetDir = 'js';
		}
		// Move CSS files
		else if (file.endsWith('.css')) {
			targetDir = 'css';
		}

		if (targetDir) {
			const targetPath = path.join(distPath, targetDir, file);
			fs.renameSync(filePath, targetPath);
			console.log(`Moved: ${file} → ${targetDir}/`);
		}
	}
});

// Remove duplicate font files from root (Angular copies to both locations)
const fontExtensions = ['.woff', '.woff2', '.ttf', '.eot'];
files.forEach(file => {
	if (fontExtensions.some(ext => file.endsWith(ext))) {
		const filePath = path.join(distPath, file);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			console.log(`Removed duplicate font: ${file}`);
		}
	}
});

// Update index.html references
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
	let html = fs.readFileSync(indexPath, 'utf8');

	// Update script and stylesheet references
	html = html.replace(/src="([^"]+\.js)"/g, 'src="js/$1"');
	html = html.replace(/href="([^"]+\.css)"/g, 'href="css/$1"');

	fs.writeFileSync(indexPath, html);
	console.log('Updated index.html file references');
}

// Fix CSS font paths after moving CSS to subdirectory
const cssDir = path.join(distPath, 'css');
if (fs.existsSync(cssDir)) {
	const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
	
	cssFiles.forEach(cssFile => {
		const cssPath = path.join(cssDir, cssFile);
		let css = fs.readFileSync(cssPath, 'utf8');
		
		// Update font paths to work from css/ subdirectory
		// Look for any font references and ensure they point to ../assets/fonts/
		css = css.replace(/url\([^)]*fa-[^)]+\.(woff2?|ttf|eot)[^)]*\)/g, (match) => {
			// Extract the font filename (now without hashes)
			const fontMatch = match.match(/fa-[^.]+\.(woff2?|ttf|eot)/);
			if (fontMatch) {
				return `url(../assets/fonts/${fontMatch[0]})`;
			}
			return match;
		});
		
		fs.writeFileSync(cssPath, css);
		console.log(`Updated font paths in ${cssFile}`);
	});
}

console.log('Build organisation complete!');
