const fs = require('fs');
const path = require('path');

const sourceManifestPath = path.join(__dirname, '..', 'manifest-firefox.json');
const targetDirectoryPath = path.join(__dirname, '..', '..', 'dist', 'firefox');
const targetManifestPath = path.join(targetDirectoryPath, 'manifest.json');

if (!fs.existsSync(targetDirectoryPath)) {
	console.error('Firefox build output not found. Run the extension build before validation.');
	process.exit(1);
}

fs.copyFileSync(sourceManifestPath, targetManifestPath);
console.log(`Prepared Firefox manifest for validation: ${targetManifestPath}`);