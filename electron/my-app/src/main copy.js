const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

require('update-electron-app')()

if (require('electron-squirrel-startup')) {
  app.quit();
}
const createWindow = () => {
  let splash = new BrowserWindow({
    fullscreen: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splash.loadFile(path.join(__dirname, 'splash.html'));

  let mainWindow = new BrowserWindow({
    fullscreen: true,
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Handle splash window closed
  splash.on('closed', () => {
    splash = null;
    mainWindow.setFullScreen(true);
  });

  // Optional: Auto-close splash after timeout (fallback)
  setTimeout(() => {
    if (splash && !splash.isDestroyed()) {
      splash.close();
      if (mainWindow) {
        mainWindow.show();
      }
    }
  }, 3000); // 3 seconds timeout

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


// ---------------------------------------
// Print Functionality 
// ---------------------------------------

function printDivContent(htmlContent) {
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  // Wait for content to load fully
  printWindow.webContents.on('did-finish-load', () => {
    printWindow.webContents.print({ 
      silent: false,
      // landscape: true
    }, (success, failureReason) => {
      if (!success) console.error('Print failed:', failureReason);
      printWindow.close();
    });
  });
}
  
ipcMain.handle('call-print', (event, htmlContent) => {
  return printDivContent(htmlContent); // or anything else
});
