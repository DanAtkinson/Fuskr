const fs = require('fs');
const path = require('path');

/**
 * Updates manifest.json files with the version from package.json
 * This ensures version consistency across all files
 */
function syncVersions() {
	try {
		// Read the version from package.json
		const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
		const version = packageJson.version;

		console.log(`Syncing version ${version} to manifest files...`);

		// Update Chromium manifest
		const chromiumManifestPath = path.join(__dirname, '..', 'manifest.json');
		if (fs.existsSync(chromiumManifestPath)) {
			const chromiumManifest = JSON.parse(fs.readFileSync(chromiumManifestPath, 'utf8'));
			chromiumManifest.version = version;
			fs.writeFileSync(chromiumManifestPath, JSON.stringify(chromiumManifest, null, '\t') + '\n');
			console.log(`✓ Updated ${chromiumManifestPath}`);
		}

		// Update Firefox manifest
		const firefoxManifestPath = path.join(__dirname, '..', 'manifest-firefox.json');
		if (fs.existsSync(firefoxManifestPath)) {
			const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf8'));
			firefoxManifest.version = version;
			fs.writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, '\t') + '\n');
			console.log(`✓ Updated ${firefoxManifestPath}`);
		}

		console.log('✅ Version sync completed successfully');
	} catch (error) {
		console.error('❌ Error syncing versions:', error.message);
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	syncVersions();
}

module.exports = { syncVersions };
