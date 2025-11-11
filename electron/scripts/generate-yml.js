const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function generateYml() {
  const version = require('../package.json').version;
  
  // Configure platforms
  const platforms = {
    // mac: {
    //   file: `NDP3-darwin-arm64-${version}.zip`,
    //   path: path.join(__dirname, '../out/make/zip/darwin/arm64'),
    //   ymlName: 'latest-mac.yml'
    // },
    // windows: {
    //   file: `NDP3 Speech Builder-${version} Setup.exe`,
    //   path: path.join(__dirname, '../out/make/squirrel.windows/x64'),
    //   ymlName: 'latest.yml'
    // }


    mac: {
      file: `NDP3-Speech-Builder-darwin-arm64-${version}.zip`,
      path: path.join(__dirname, '../out/make/zip/darwin/arm64'),
      ymlName: 'latest-mac.yml'
    },
    windows: {
      file: `NDP3-Speech-Builder-${version} Setup.exe`,
      path: path.join(__dirname, '../out/make/squirrel.windows/x64'),
      ymlName: 'latest.yml'
    }

  };

  // Generate YML for each platform
  for (const [platform, config] of Object.entries(platforms)) {
    try {
      const filePath = path.join(config.path, config.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${platform}: ${config.file} not found`);
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
          url: config.file,
          sha512,
          size: stats.size
        }],
        path: config.file,
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