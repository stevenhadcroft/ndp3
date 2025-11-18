const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const fs = require('fs');

//-----------------------------------------------
// manually create 'app-update'
//-----------------------------------------------
// ALTHOUGH PLACEHOLDER - 
// SEEMS WE DO NEED THE SCRIPT BELOW FOR UPDATES TO WORK PROPERLY
// OR MAYBE ITS BECASE FILE HAS BBEEN DOWNLOADED
// let yaml = '';
// yaml += "provider: generic\n"
// yaml += "url: your_site/update/windows_64\n"
// yaml += "useMultipleRangeRequest: false\n"
// yaml += "channel: latest\n"
// yaml += "updaterCacheDirName: " + app.getName()
// let update_file = [path.join(process.resourcesPath, 'app-update.yml'), yaml]
// let dev_update_file = [path.join(process.resourcesPath, 'dev-app-update.yml'), yaml]
// let chechFiles = [update_file, dev_update_file]
// for (let file of chechFiles) {
//     if (!fs.existsSync(file[0])) {
//         fs.writeFileSync(file[0], file[1], () => { })
//     }
// }
//-----------------------------------------------

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

let updateInfo = {}; // Store update info

// Update event handlers
autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  updateInfo = info; // Store the update info

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
  
  mainWindow.webContents.send('download-progress', {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond,
      version: updateInfo ? updateInfo.version : null // Include version
  });
});

// IMPORTANT - kick starts install if already downloaded
autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  const dialogOpts = {
    type: 'info',
    buttons: ['Install Now', 'Later'],
    title: 'Update Ready',
    message: `Version ${info.version} is ready to install`,
    detail: 'The application will restart to apply the update.'
  };
  dialog.showMessageBox(dialogOpts).then(({ response }) => {
    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

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

  // ipcMain.removeHandler('call-print');
  ipcMain.handle('call-print', async (event, htmlContent) => {
    try {
      await handlePrint(htmlContent);
      return { success: true };
    } catch (error) {
      console.error('Print error:', error);
      return { success: false, error: error.message };
    }
  });
  
  // ipcMain.removeHandler('close-app');
  ipcMain.handle('close-app', () => {
    app.quit();
  });
  
  // ipcMain.removeHandler('get-version');
  ipcMain.handle('get-version', () => {
    return app.getVersion();
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




