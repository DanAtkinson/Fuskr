# Extension Security Configuration

## Overview

This extension uses RSA public key cryptography for enhanced security and consistent extension ID management across versions and deployments.

## Implementation Details

### Public Key
- **Purpose**: Ensures consistent extension ID across updates
- **Algorithm**: RSA-2048
- **Format**: Base64-encoded SPKI (SubjectPublicKeyInfo)
- **Location**: Added to `manifest.json` and `manifest-firefox.json`

### Security Benefits
1. **Consistent Extension ID**: The same public key ensures the extension maintains the same ID across versions
2. **Enhanced Store Submission**: Aids in Chrome Web Store and Firefox Add-ons store submission processes
3. **Tamper Detection**: Provides cryptographic verification of extension authenticity
4. **Update Continuity**: Users won't lose settings/data when extensions update

### Key Management
- **Private Key**: `extension-private-key.pem` (secured in .gitignore)
- **Public Key**: Embedded in manifest files
- **Generator Script**: `generate-extension-keys.js` (excluded from git)

## Store Submission Notes

### Chrome Web Store
- The `key` field in manifest.json provides consistent extension ID
- Chrome automatically handles additional signing during store review
- This helps with developer verification and update management

### Firefox Add-ons
- Firefox also recognizes the key field for ID consistency
- Additional signing handled by Mozilla's review process

## Security Best Practices
- ✅ Private key is excluded from version control
- ✅ Key generation script is excluded from distribution
- ✅ Public key is properly embedded in manifest
- ✅ Uses industry-standard RSA-2048 encryption

## Regeneration
If keys need to be regenerated:
1. Run the key generation script
2. Update the public key in both manifest files
3. Note that this will change the extension ID
