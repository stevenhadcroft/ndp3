const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { version } = require('./package.json');
require('dotenv').config();

// Determine platform-specific name
const isWindows = process.platform === 'win32';
const appName = isWindows ? 'NDP3Digital' : 'NDP3 Digital';

// Azure Artifact Signing (formerly Trusted Signing). Only enabled when the account details are
// in .env, so unsigned local builds still work. Auth comes from AZURE_TENANT_ID / AZURE_CLIENT_ID /
// AZURE_CLIENT_SECRET, which the signing dlib reads from the environment.
let windowsSign;
if (isWindows && process.env.AZURE_SIGNING_ENDPOINT) {
  const os = require('os');
  const path = require('path');
  const fs = require('fs');

  const metadataPath = path.join(os.tmpdir(), 'ndp3-artifact-signing.json');
  fs.writeFileSync(metadataPath, JSON.stringify({
    Endpoint: process.env.AZURE_SIGNING_ENDPOINT,
    CodeSigningAccountName: process.env.AZURE_SIGNING_ACCOUNT,
    CertificateProfileName: process.env.AZURE_SIGNING_PROFILE
  }));

  windowsSign = {
    // The signtool bundled with @electron/windows-sign is too old for /dlib
    signToolPath: process.env.WINDOWS_SIGNTOOL_PATH ||
      'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.26100.0\\x64\\signtool.exe',
    signWithParams: [
      '/dlib', process.env.AZURE_SIGNING_DLIB ||
        path.join(os.homedir(), 'AppData\\Local\\Microsoft\\MicrosoftArtifactSigningClientTools\\Azure.CodeSigning.Dlib.dll'),
      '/dmdf', metadataPath
    ],
    hashes: ['sha256'], // Artifact Signing doesn't support SHA1 dual-signing
    timestampServer: 'http://timestamp.acs.microsoft.com',
    description: 'NDP3 Digital'
  };
}

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './icons/NDP3_icon_256',
    name: appName, // Conditional: no spaces on Windows, spaces allowed on macOS
    executableName: 'NDP3 Digital',
    appBundleId: 'com.ndp3.app',

    // WINDOWS - NEEDED ????§
    // ...existing config...
    win32metadata: {
      CompanyName: 'Steven Hadcroft',
      FileDescription: 'NDP3 Digital',
      OriginalFilename: 'NDP3 Digital.exe',
      ProductName: 'NDP3 Digital',
      InternalName: 'NDP3 Digital'
    },

    windowsSign, // signs the app exe/dlls; undefined (unsigned) when Azure signing isn't configured

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
        // name: `NDP3-Digital-${version}`, // This controls the DMG filename
      }
    },
     {
      name: '@electron-forge/maker-wix',
      platforms: ['win32'],
      config: {
        name: 'NDP3 Digital',
        shortName: 'NDP3Digital', // no spaces: used for the squirrel AppUserModelId and stub exe, which don't tolerate them
        exe: 'NDP3 Digital.exe', // must match packagerConfig.executableName
        manufacturer: 'Steven Hadcroft',
        description: 'NDP3 Digital',
        shortcutName: 'NDP3 Digital', // Start menu/desktop shortcut (defaults to `name`)
        icon: './icons/NDP3_icon_256.ico', // Windows needs .ico
        ui: {
          chooseDirectory: true
        },
        defaultInstallMode: 'perUser', // no admin/UAC prompt, matches prior Squirrel UX and allows silent background updates
        upgradeCode: '9f3b2e8a-6b2d-4a3e-9c0a-6c1d2f5e4a7b', // fixed GUID so MSI upgrades replace prior installs instead of side-by-side installing
        arch: 'x64', // otherwise defaults to x86 and targets Program Files (x86)
        windowsSign, // signs the .msi itself
        // Windows Installer only honours MSIINSTALLPERUSER when ALLUSERS=2. Without it the
        // MSI tries to write to Program Files with no elevation and fails with Error 1303.
        beforeCreate: (msiCreator) => {
          msiCreator.wixTemplate = msiCreator.wixTemplate.replace(
            '<Property Id="MSIINSTALLPERUSER"',
            '<Property Id="ALLUSERS" Secure="yes" Value="2" />\n    <Property Id="MSIINSTALLPERUSER"'
          );
        }
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

