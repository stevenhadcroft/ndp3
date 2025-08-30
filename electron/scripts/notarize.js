const { notarize } = require('@electron/notarize');
require('dotenv').config();

console.log('🔍 Starting notarization process...');

(async () => {
    console.log('🔍 inside aync...'); 
    try {
      await notarize({
        tool: 'notarytool',  // Explicitly specify notarytool
        appBundleId: '',        
        appPath: '',
        appleId: '',
        appleIdPassword: '', 
        teamId: '',

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
  