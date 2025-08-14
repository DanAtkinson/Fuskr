const crypto = require('crypto');

// Extract the base64 key from manifest.json
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('src/manifest.json', 'utf8'));
const publicKeyBase64 = manifest.key;

console.log('🔑 RSA Public Key (Base64):');
console.log(publicKeyBase64);
console.log('');

// Convert base64 to DER format
const publicKeyDER = Buffer.from(publicKeyBase64, 'base64');

// Calculate SHA-256 hash
const hash = crypto.createHash('sha256');
hash.update(publicKeyDER);
const hashBuffer = hash.digest();

// Take first 16 bytes and convert to extension ID format
const extensionIdBytes = hashBuffer.subarray(0, 16);

// Convert to Chrome extension ID format (a-p instead of 0-f)
const extensionId = Array.from(extensionIdBytes)
  .map(byte => {
    const hex = byte.toString(16).padStart(2, '0');
    return hex
      .replace(/0/g, 'a')
      .replace(/1/g, 'b')
      .replace(/2/g, 'c')
      .replace(/3/g, 'd')
      .replace(/4/g, 'e')
      .replace(/5/g, 'f')
      .replace(/6/g, 'g')
      .replace(/7/g, 'h')
      .replace(/8/g, 'i')
      .replace(/9/g, 'j')
      .replace(/a/g, 'k')
      .replace(/b/g, 'l')
      .replace(/c/g, 'm')
      .replace(/d/g, 'n')
      .replace(/e/g, 'o')
      .replace(/f/g, 'p');
  })
  .join('');

console.log('🆔 Chrome Extension ID:');
console.log(extensionId);
console.log('');
console.log('🔗 Chrome Web Store URL:');
console.log(`https://chrome.google.com/webstore/detail/${extensionId}`);
console.log('');
console.log('📋 For GitHub Secrets, add:');
console.log(`CHROME_EXTENSION_ID=${extensionId}`);
