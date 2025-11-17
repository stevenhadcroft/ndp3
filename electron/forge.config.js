const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { version } = require('./package.json');
require('dotenv').config();

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './icons/NDP3_icon_256',
    name: 'NDP3-Speech-Builder',
    executableName: 'NDP3 Speech Builder',
    appBundleId: 'com.ndp3.app',

    // WINDOWS - NEEDED ????§
    // ...existing config...
    win32metadata: {
      CompanyName: 'Steven Hadcroft',
      FileDescription: 'NDP3 Speech Builder',
      OriginalFilename: 'NDP3 Speech Builder.exe',
      ProductName: 'NDP3 Speech Builder',
      InternalName: 'NDP3 Speech Builder'
    },

    osxSign: {
      identity: 'Developer ID Application: Steven Hadcroft (B4AWA83RK2)',
      hardenedRuntime: true,
      entitlements: "entitlements.plist",
      "entitlements-inherit": "entitlements.plist",
      "gatekeeper-assess": false
    },

    
    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
      appBundleId: 'com.ndp3.app',
      timeout: 3600000, // 1 hour in milliseconds
      retries: 3
    }

    // Important: Add this to ensure signing happens
    // signBundle: true,
    

  },

  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },

    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        icon: './icons/NDP3_icon_256.icns', // macOS needs .icns
        name: `NDP3-Speech-Builder-${version}`, // This controls the DMG filename
        
      }
    },
     {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        // name: 'NDP3SpeechBuilder',
        iconUrl: 'http://berthasworkers.com/dev/ndp3v2/NDP3_icon_256.ico', // Windows needs .ico
        setupIcon: './icons/NDP3_icon_256.ico',
        setupExe: `NDP3-Speech-Builder-${version}.Setup.exe`, // Add this line to control setup filename
        certificateFile: process.env.WINDOWS_CERT_PATH,
        certificatePassword: process.env.WINDOWS_CERT_PASSWORD
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    }
  ],

  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: process.env.GITHUB_OWNER,
          name: process.env.GITHUB_REPO
        },
        prerelease: false,
        draft: false,
        generateUpdateInfo: true, // This ensures latest-mac.yml is generated
        authToken: process.env.GITHUB_TOKEN,
        
        // WINDOWS - NEEDED ????
        // Add Windows update config
        windowsUpdateInfo: {
          publisherName: 'Steven Hadcroft',
          verifyUpdates: true
        }
      }
    }
  ],

  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};