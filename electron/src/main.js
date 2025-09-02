const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const fs = require('fs');

//-----------------------------------------------
// manually create 'app-update'
//-----------------------------------------------
// const feed = 'your_site/update/windows_64'
let yaml = '';
yaml += "provider: generic\n"
yaml += "url: your_site/update/windows_64\n"
yaml += "useMultipleRangeRequest: false\n"
yaml += "channel: latest\n"
yaml += "updaterCacheDirName: " + app.getName()

let update_file = [path.join(process.resourcesPath, 'app-update.yml'), yaml]
let dev_update_file = [path.join(process.resourcesPath, 'dev-app-update.yml'), yaml]
let chechFiles = [update_file, dev_update_file]

for (let file of chechFiles) {
    if (!fs.existsSync(file[0])) {
        fs.writeFileSync(file[0], file[1], () => { })
    }
}
log.info('FIX END - app-update.yml - process.resourcesPath ', process.resourcesPath);
//-----------------------------------------------

// (async () => {
//   const { updateElectronApp } = await import('update-electron-app');
//   updateElectronApp({
//     repo: 'stevenhadcroft/ndp3',
//     updateInterval: '1 hour',
//     logger: require('electron-log')
//   });
// })();

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Early exit for Squirrel startup
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Configure auto-updates
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'stevenhadcroft',
  repo: 'ndp3',
});

// Check for updates every hour
setInterval(() => {
  autoUpdater.checkForUpdates();
}, 60 * 60 * 1000);


// Update event handlers
autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  const dialogOpts = {
    type: 'info',
    buttons: ['Download', 'Later'],
    title: 'Application Update',
    message: `Version ${info.version} is available`,
    detail: 'Would you like to download the update?'
  };

  dialog.showMessageBox(dialogOpts).then(({ response }) => {
    if (response === 0) {
      // User clicked Download
      autoUpdater.downloadUpdate();
    }
  });
});

// Add progress handler
autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
  logMessage += ` - Downloaded ${progressObj.percent}%`;
  logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
  log.info(logMessage);
  // Send progress to window if you want to show it in UI
  // if (mainWindow) {
  //   mainWindow.setProgressBar(progressObj.percent / 100);
  // }
  mainWindow.webContents.send('download-progress', {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond
  });
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  // Clear the progress bar
  // if (mainWindow) {
  //   mainWindow.setProgressBar(-1);
  // }
  autoUpdater.quitAndInstall();
  
  // const dialogOpts = {
  //   type: 'info',
  //   buttons: ['Restart', 'Later'],
  //   title: 'Update Ready',
  //   message: `Version ${info.version} is ready to install`,
  //   detail: 'The update will be installed when you restart the application.'
  // };
  // dialog.showMessageBox(dialogOpts).then(({ response }) => {
  //   if (response === 0) autoUpdater.quitAndInstall();
  // });
});

/*
// Update event handlers
autoUpdater.on('update-available', () => {

  log.info('Update available');
  // autoUpdater.checkForUpdatesAndNotify();
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: "", // process.platform === 'win32' ? releaseNotes : releaseName,
    detail:
    // 'A new version has been downloaded. Restart the application to apply the updates.'
    'A new version has been found. Restart the application to apply the updates.'
  }
  
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
});

// autoUpdater.on('update-downloaded', () => {
//   log.info('Update downloaded');
//   autoUpdater.quitAndInstall();
// });
*/

/* */

//--------------------------------------------
// Main App 
//     & 
// Splash page
//--------------------------------------------

// Window management
let mainWindow = null;
let splashWindow = null;

// Window creation
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    fullscreen: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));

  splashWindow.on('closed', () => {
    splashWindow = null;
    if (mainWindow) {
      mainWindow.show();
      mainWindow.setFullScreen(true);

      // Check for updates shorly after launch
      setTimeout(() => {
        autoUpdater.checkForUpdates();
      }, 2000);

    }
  });

  // Fallback timeout for splash screen
  setTimeout(() => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
    }
  }, 3000);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Dev tools (commented out for production)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

//--------------------------------------------
// IPC
//
// Print functionality
// (not sure this actually improved on default JS approach)
//--------------------------------------------

function createPrintWindow(htmlContent) {
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  return printWindow;
}

async function handlePrint(htmlContent) {
  const printWindow = createPrintWindow(htmlContent);

  return new Promise((resolve, reject) => {
    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print({ 
        silent: false,
      }, (success, failureReason) => {
        printWindow.close();
        if (success) {
          resolve();
        } else {
          reject(new Error(`Print failed: ${failureReason}`));
        }
      });
    });
  });
}

// IPC handlers
function setupIPC() {
  ipcMain.handle('call-print', async (event, htmlContent) => {
    try {
      await handlePrint(htmlContent);
      return { success: true };
    } catch (error) {
      console.error('Print error:', error);
      return { success: false, error: error.message };
    }
  });
}

// App lifecycle
function handleAppReady() {
  createSplashWindow();
  createMainWindow();
  setupIPC();
}

function handleActivate() {
  if (BrowserWindow.getAllWindows().length === 0) {
    handleAppReady();
  }
}

// App event listeners
app.whenReady().then(handleAppReady);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', handleActivate);


