const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function generateYml() {
  const version = require('../package.json').version;
  const zipFile = `NDP3-darwin-arm64-${version}.zip`;
  const zipPath = path.join(__dirname, '../out/make/zip/darwin/arm64', zipFile);

  // Generate SHA512 hash
  const fileBuffer = fs.readFileSync(zipPath);
  const hashSum = crypto.createHash('sha512');
  hashSum.update(fileBuffer);
  const sha512 = hashSum.digest('base64');

  // Get file size
  const stats = fs.statSync(zipPath);

  const yml = {
    version,
    files: [{
      url: zipFile,
      sha512,
      size: stats.size
    }],
    path: zipFile,
    sha512,
    releaseDate: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(__dirname, '../out/latest-mac.yml'),
    JSON.stringify(yml, null, 2)
  );
}

generateYml();