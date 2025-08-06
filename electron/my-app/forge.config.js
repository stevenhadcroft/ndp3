const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
// const osxSign = require('electron-osx-sign');
const { notarize } = require('@electron/notarize');
require('dotenv').config();

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './icons/NDP3_icon_256',
    name: 'NDP3',
    executableName: 'NDP3',

    osxSign: {
      identity: 'Developer ID Application: Steven Hadcroft (B4AWA83RK2)',
      hardenedRuntime: true,
      entitlements: "entitlements.plist",
      "entitlements-inherit": "entitlements.plist",
      "gatekeeper-assess": false
    },
    // Important: Add this to ensure signing happens
    signBundle: true,

    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    }
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
        name: 'NDP3'
      }
    },
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   platforms: ['win32'],
    //   config: {
    //     iconUrl: './icons/NDP3_icon_256.ico', // Windows needs .ico
    //     setupIcon: './icons/NDP3_icon_256.ico',
    //     ame: 'NDP3'
    //   }
    // }
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
        draft: true,
        authToken: process.env.GITHUB_TOKEN
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
