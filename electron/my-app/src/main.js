const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

// Early exit for Squirrel startup
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Enable auto-updates
require('update-electron-app')();

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

// Print functionality
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