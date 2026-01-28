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

   // Setup IPC handlers after window is created
  setupIPC();

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

  // Remove duplicate handlers
  ipcMain.removeHandler('call-print');
  ipcMain.removeHandler('close-app');
  ipcMain.removeHandler('get-version');
  ipcMain.removeHandler('save-project');
  ipcMain.removeHandler('load-project');
  ipcMain.removeHandler('delete-project');
  ipcMain.removeHandler('list-projects');
  ipcMain.removeHandler('get-user-data-path');
  ipcMain.removeHandler('create-dir');
  ipcMain.removeHandler('get-dirs');
  ipcMain.removeHandler('delete-dir');

  ipcMain.handle('call-print', async (event, htmlContent) => {
    try {
      await handlePrint(htmlContent);
      return { success: true };
    } catch (error) {
      console.error('Print error:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('close-app', () => {
    app.quit();
  });
  
  ipcMain.handle('get-version', () => {
    return app.getVersion();
  });
  
  ipcMain.handle('get-dirs', async () => {
    console.log( 'IPC get-dirs called with dirname:');
  });
 

  //-------------------------------------
  // File system operations
  //-------------------------------------
  // File system paths
  const projectsDir = path.join(app.getPath('userData'), 'projects');
  const dirsMetaFile = path.join(app.getPath('userData'), 'directories.json');
  
  // Ensure projects directory exists
  fs.mkdir(projectsDir, { recursive: true }).catch(console.error);
  
  // Existing handlers
  ipcMain.handle('get-user-data-path', () => app.getPath('userData'));
  
  // Project handlers
  ipcMain.handle('save-project', async (event, data) => {
    try {
      const { name, projectid, description, thumbnail, data: projectData, dirname, orientation } = data;
      const filename = `${name}.json`;
      
      let filepath;
      if (dirname) {
        const dirPath = path.join(projectsDir, dirname);
        await fs.mkdir(dirPath, { recursive: true });
        filepath = path.join(dirPath, filename);
      } else {
        filepath = path.join(projectsDir, filename);
      }
      
      await fs.writeFile(filepath, JSON.stringify({
        name,
        projectid,
        description,
        thumbnail,
        data: projectData,
        dirname,
        orientation,
        savedAt: new Date().toISOString()
      }, null, 2));
      
      return { success: true, filepath };
    } catch (error) {
      log.error('Error saving project:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('load-project', async (event, filename) => {
    try {
      const filepath = path.join(projectsDir, filename);
      const data = await fs.readFile(filepath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      log.error('Error loading project:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('delete-project', async (event, filename) => {
    try {
      const filepath = path.join(projectsDir, filename);
      await fs.unlink(filepath);
      return { success: true };
    } catch (error) {
      log.error('Error deleting project:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('list-projects', async (event, dirname) => {
    try {
      let searchDir = projectsDir;
      if (dirname) {
        searchDir = path.join(projectsDir, dirname);
      }
      
      // try {
      //   await fs.access(searchDir);
      // } catch {
      //   return { success: true, projects: [] };
      // }
      
      const files = await fs.readdir(searchDir);
      const projects = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filepath = path.join(searchDir, file);
          const data = await fs.readFile(filepath, 'utf8');
          projects.push(JSON.parse(data));
        }
      }
      
      return { success: true, projects };
    } catch (error) {
      log.error('Error listing projects:', error);
      return { success: false, error: error.message, projects: [] };
    }
  });

  // Directory handlers
  ipcMain.handle('create-dir', async (event, dirname) => {
    try {
      let dirs = [];
      try {
        const data = await fs.readFile(dirsMetaFile, 'utf8');
        dirs = JSON.parse(data);
      } catch (error) {
        dirs = [];
      }
      
      if (!dirs.some(d => d.dirname === dirname)) {
        dirs.push({
          dirname,
          createdAt: new Date().toISOString()
        });
        
        await fs.writeFile(dirsMetaFile, JSON.stringify(dirs, null, 2));
        
        const dirPath = path.join(projectsDir, dirname);
        await fs.mkdir(dirPath, { recursive: true });
      }
      
      return { success: true };
    } catch (error) {
      log.error('Error creating directory:', error);
      return { success: false, error: error.message };
    }
  });
  
  ipcMain.handle('XXget-dirs', async () => {
    try {
      let dirs = [];
      try {
        const data = await fs.readFile(dirsMetaFile, 'utf8');
        dirs = JSON.parse(data);
      } catch (error) {
        dirs = [];
      }
      
      return { success: true, directories: dirs };
    } catch (error) {
      log.error('Error getting directories:', error);
      return { success: false, error: error.message, directories: [] };
    }
  });
  
  ipcMain.handle('delete-dir', async (event, dirname) => {
    try {
      let dirs = [];
      try {
        const data = await fs.readFile(dirsMetaFile, 'utf8');
        dirs = JSON.parse(data);
      } catch (error) {
        dirs = [];
      }
      
      dirs = dirs.filter(d => d.dirname !== dirname);
      await fs.writeFile(dirsMetaFile, JSON.stringify(dirs, null, 2));
      
      const dirPath = path.join(projectsDir, dirname);
      try {
        await fs.rm(dirPath, { recursive: true, force: true });
      } catch (error) {
        log.warn('Directory not found physically:', error);
      }
      
      return { success: true };
    } catch (error) {
      log.error('Error deleting directory:', error);
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




