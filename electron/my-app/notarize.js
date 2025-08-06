const { notarize } = require('@electron/notarize');
require('dotenv').config();

console.log('🔍 Starting notarization process...');

(async () => {
    console.log('🔍 inside aync...'); 
    try {
      await notarize({
        tool: 'notarytool',  // Explicitly specify notarytool
        appBundleId: 'com.ndp3.app',        
        appPath: '/Users/stevenhadcroft/Desktop/electronforge-helloworld-2/my-app/out/NDP3-darwin-arm64/NDP3.app',
        appleId: 'steven@hadcroft.com',
        appleIdPassword: 'wbyq-buiz-irae-exnt', // or use `@keychain:` reference
        // appleIdPassword: '@keychain:AC_PASSWORD',
        teamId: 'B4AWA83RK2',

        // Add progress callback
        onProgress: (status) => {
          // clearInterval(progressInterval);
          // const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
          // console.log(`\r🔄 [${elapsedSeconds}s] Status: ${status.status || 'uploading'}`);
          
          if (status.message) {
              console.log(`   📝 ${status.message}`);
          }
          if (status.percentage) {
              const progress = '='.repeat(Math.floor(status.percentage / 2)) + '>';
              console.log(`   [${progress.padEnd(50)}] ${status.percentage}%`);
          }
      }

      });
  
      console.log('✅ Notarization complete!');
    } catch (err) {
      console.error('❌ Notarization failed:', err);
    }
  })();
  