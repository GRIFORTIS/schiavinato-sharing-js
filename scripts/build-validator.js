#!/usr/bin/env node

/**
 * Build script for DuraShare Validator
 * 
 * This script:
 * 1. Reads the current version from package.json
 * 2. Injects the version into the validator HTML
 * 3. Creates checksums for verification
 * 4. Produces a standalone HTML artifact for GitHub Releases
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Paths
const rootDir = path.join(__dirname, '..');
const validatorDir = path.join(rootDir, 'validator');
const packageJsonPath = path.join(rootDir, 'package.json');
const validatorPackageJsonPath = path.join(validatorDir, 'package.json');
const htmlPath = path.join(validatorDir, 'JS_Library_Validator.html');

console.log('🔨 Building DuraShare Validator...\n');

// Read version from main package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`📦 Main library version: ${version}`);

// Update validator package.json version
const validatorPackageJson = JSON.parse(fs.readFileSync(validatorPackageJsonPath, 'utf8'));
validatorPackageJson.version = version;
fs.writeFileSync(validatorPackageJsonPath, JSON.stringify(validatorPackageJson, null, 2) + '\n');
console.log(`✓ Updated validator/package.json to version ${version}`);

// Read HTML file
let html = fs.readFileSync(htmlPath, 'utf8');

// Inject version into HTML (replace existing version markers)
// 1) Header comment (top-of-file)
html = html.replace(
  /DuraShare Validator v[\d.]+/g,
  `DuraShare Validator v${version}`
);

// 2) Design system marker (purely informational)
html = html.replace(
  /DESIGN SYSTEM \(v[\d.]+\)/g,
  `DESIGN SYSTEM (v${version})`
);

// 3) Footer version (authoritative)
html = html.replace(
  /<p><strong>GRIFORTIS DuraShare - JS Library Validator v[\d.]+<\/strong>/,
  `<p><strong>GRIFORTIS DuraShare - JS Library Validator v${version}</strong>`
);

// If no footer version found, add version comment at the top
if (!html.includes(`v${version}</strong>`)) {
  html = html.replace(
    /<html lang="en">/,
    `<html lang="en">\n<!-- DuraShare Validator v${version} -->`
  );
}

// Write updated HTML
fs.writeFileSync(htmlPath, html);
console.log(`✓ Injected version ${version} into HTML`);

// Create SHA256 checksum
const htmlContent = fs.readFileSync(htmlPath);
const hash = crypto.createHash('sha256').update(htmlContent).digest('hex');
const checksumPath = path.join(validatorDir, 'JS_Library_Validator.html.sha256');
fs.writeFileSync(checksumPath, `${hash}  JS_Library_Validator.html\n`);
console.log(`✓ Created checksum: ${hash.substring(0, 16)}...`);

// Create standalone versioned copy for releases
const standaloneDir = path.join(validatorDir, 'dist');
if (!fs.existsSync(standaloneDir)) {
  fs.mkdirSync(standaloneDir, { recursive: true });
}

const standalonePath = path.join(standaloneDir, `durashare-validator-v${version}.html`);
fs.copyFileSync(htmlPath, standalonePath);

const standaloneChecksumPath = `${standalonePath}.sha256`;
fs.writeFileSync(standaloneChecksumPath, `${hash}  durashare-validator-v${version}.html\n`);
console.log(`✓ Created standalone: validator/dist/durashare-validator-v${version}.html`);

// Verify version consistency
console.log('\n🔍 Verifying version consistency...');
const footerVersion = html.match(
  /GRIFORTIS DuraShare - JS Library Validator v([\d.]+)<\/strong>/
);
if (footerVersion && footerVersion[1] === version) {
  console.log(`✓ Version ${version} verified in HTML`);
} else {
  console.error(
    `✗ Version mismatch! Expected ${version}, found ${footerVersion ? footerVersion[1] : 'none'}`
  );
  process.exit(1);
}

console.log('\n✅ Validator build complete!');
console.log('\nNext steps:');
console.log('  - Test the validator locally: npm run validator');
console.log('  - Download the signed HTML from GitHub Releases\n');

