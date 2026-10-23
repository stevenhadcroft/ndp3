const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Mirrors @electron-forge/publisher-github's GitHub.sanitizeName() - GitHub replaces any
// character outside \w_.@+- with a dot when a release asset is uploaded, so the filename on
// the release (fileOut) never matches the locally-built filename (fileIn) exactly.
function sanitizeName(name) {
  return path.basename(name)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w_.@+-]+/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\./, '')
    .replace(/\.$/, '');
}

async function generateYml() {
  const version = require('../package.json').version;

  // Must match packagerConfig.name (mac) / the wix `exe` option (windows) in forge.config.js -
  // electron-forge derives the packaged filenames from those.
  const macAppName = 'NDP3 Digital';
  const windowsExeName = 'NDP3 Digital.exe';

  // Configure platforms
  const platforms = {
    mac: {
      fileIn: `${macAppName}-darwin-arm64-${version}.zip`,
      fileOut: sanitizeName(`${macAppName}-darwin-arm64-${version}.zip`),
      path: path.join(__dirname, '../out/make/zip/darwin/arm64'),
      ymlName: 'latest-mac.yml'
    },
    windows: {
      // maker-wix (electron-wix-msi) names the output file "<exe>.msi"
      fileIn: `${windowsExeName}.msi`,
      fileOut: sanitizeName(`${windowsExeName}.msi`),
      path: path.join(__dirname, '../out/make/wix/x64'),
      ymlName: 'latest.yml'
    }
  };

  // Generate YML for each platform
  for (const [platform, config] of Object.entries(platforms)) {
    try {
      const filePath = path.join(config.path, config.fileIn);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${platform}: ${config.fileIn} not found`);
        continue;
      }

      // Generate SHA512 hash
      const fileBuffer = fs.readFileSync(filePath);
      const hashSum = crypto.createHash('sha512');
      hashSum.update(fileBuffer);
      const sha512 = hashSum.digest('base64');

      // Get file size
      const stats = fs.statSync(filePath);

      const yml = {
        version,
        files: [{
          url: config.fileOut,
          sha512,
          size: stats.size
        }],
        path: config.fileOut,
        sha512,
        releaseDate: new Date().toISOString()
      };

      // Write YML file
      const ymlPath = path.join(__dirname, '../out', config.ymlName);
      fs.writeFileSync(ymlPath, JSON.stringify(yml, null, 2));
      console.log(`✅ Generated ${config.ymlName}`);
    } catch (error) {
      console.error(`❌ Error generating ${platform} YML:`, error);
    }
  }
}

generateYml().catch(console.error);