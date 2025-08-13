const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get command line arguments
const sourceDir = process.argv[2];
const outputFile = process.argv[3];

if (!sourceDir || !outputFile) {
	console.error('Usage: node zip-build.js <source-directory> <output-file>');
	process.exit(1);
}

const sourcePath = path.resolve(sourceDir);
const outputPath = path.resolve(outputFile);

if (!fs.existsSync(sourcePath)) {
	console.error(`Source directory does not exist: ${sourcePath}`);
	process.exit(1);
}

try {
	// Remove existing zip file if it exists
	if (fs.existsSync(outputPath)) {
		fs.unlinkSync(outputPath);
	}

	// Create zip using Node.js built-in capabilities or system command
	if (process.platform === 'win32') {
		// Use PowerShell on Windows for compatibility
		const psCommand = `Compress-Archive -Path '${sourcePath}/*' -DestinationPath '${outputPath}' -Force`;
		execSync(`powershell "${psCommand}"`, { stdio: 'inherit' });
	} else {
		// Use zip command on Unix-like systems
		execSync(`cd "${sourcePath}" && zip -r "${outputPath}" .`, { stdio: 'inherit' });
	}

	console.log(`Successfully created: ${outputPath}`);
} catch (error) {
	console.error(`Failed to create zip file: ${error.message}`);
	process.exit(1);
}
