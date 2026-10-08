const { app, BrowserWindow, ipcMain, dialog, screen, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const fsSync = require('fs');
const { promises: fs } = require('fs');

const MY_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

//-----------------------------------------------
// manually create 'app-update'
//-----------------------------------------------
// KEEP THIS (ALTHOUGH FEELS PLACEHOLDER) -  SEEMS WE DO NEED THE SCRIPT BELOW FOR UPDATES TO WORK PROPERLY
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
    if (!fsSync.existsSync(file[0])) {
        fsSync.writeFileSync(file[0], file[1], () => { })
    }
}


//-----------------------------------------------

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Early exit for Squirrel startup
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Configure auto-updates
autoUpdater.autoDownload = false;

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
let downloadInProgress = false;

const sendToRenderer = (channel, payload) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
};

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
      downloadInProgress = true;
      autoUpdater.downloadUpdate();
    }
  });
});

// Add progress handler
autoUpdater.on('download-progress', (progressObj) => {
  sendToRenderer('download-progress', {
    percent: progressObj.percent,
    transferred: progressObj.transferred,
    total: progressObj.total,
    bytesPerSecond: progressObj.bytesPerSecond,
    version: updateInfo ? updateInfo.version : null
  });
});

autoUpdater.on('error', (err) => {
  log.error('Update error:', err);

  // Tell renderer to clear the progress UI if a download was running
  if (downloadInProgress) {
    sendToRenderer('update-error', { message: err.message || 'Unknown error' });
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      title: 'Update Failed',
      message: 'An error occurred during the update',
      detail: err.message || 'Unknown error'
    });
  }
  downloadInProgress = false;
});

// IMPORTANT - kick starts install if already downloaded
autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  downloadInProgress = false;
  const dialogOpts = {
    type: 'info',
    buttons: ['Install Now'], // , 'Later'
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
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  splashWindow = new BrowserWindow({
    // fullscreen: true,
    width: Math.floor(width * 0.5),
    height: Math.floor(height * 0.7),
    center: true,
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
      // mainWindow.setFullScreen(true);

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
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const isWindows = process.platform === 'win32';
  
  mainWindow = new BrowserWindow({
    // fullscreen: true,
    width: Math.floor(width * 1),
    height: Math.floor(height * 1),
    center: true,
    show: false,
    // Windows: hide the default title bar and draw the native min/max/close
    // controls over the top-right of the app's own header instead
    ...(isWindows && {
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#015698',     // matches --color-ui-menu-header
        symbolColor: '#ffffff',
        height: 50,           // matches .menu-header height
      },
    }),
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

// Per-user file storage
//
// Projects, folders and "my images" are scoped under a subfolder per signed-in
// user (identified by the email recorded via localLicenseMananger.linkMachine
// on the renderer side), so different people signing in on the same machine
// don't see each other's saved work.
//
// Kept at module scope (not inside setupIPC, which runs more than once per
// launch) so the one-time legacy-data migration below only ever runs once.
const usersRoot = path.join(app.getPath('userData'), 'users');
let migrationPromise = null;

function sanitizeUserId(userId) {
  const id = (userId || '').toString().trim().toLowerCase();
  const safe = id.replace(/[^a-z0-9._-]/g, '_');
  return safe || 'default';
}

// Existing (pre-multi-user) installs kept everything directly under
// userData/. The first time any user directory is requested after upgrading,
// move that flat data into place for whichever user is signing in first —
// almost always the sole existing user of the install.
async function migrateLegacyDataOnce(userRoot) {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      const usersRootExisted = await fs.access(usersRoot).then(() => true).catch(() => false);
      if (usersRootExisted) return;

      const legacyProjectsDir = path.join(app.getPath('userData'), 'projects');
      const legacyDirsMetaFile = path.join(app.getPath('userData'), 'directories.json');
      const legacyMyImagesDir = path.join(app.getPath('userData'), 'my-images');

      await fs.mkdir(userRoot, { recursive: true });

      for (const [src, dest] of [
        [legacyProjectsDir, path.join(userRoot, 'projects')],
        [legacyDirsMetaFile, path.join(userRoot, 'directories.json')],
        [legacyMyImagesDir, path.join(userRoot, 'my-images')],
      ]) {
        const exists = await fs.access(src).then(() => true).catch(() => false);
        if (exists) {
          await fs.rename(src, dest).catch((error) => log.error('Error migrating legacy data', src, error));
        }
      }
    })();
  }
  return migrationPromise;
}

async function getUserPaths(userId) {
  const userRoot = path.join(usersRoot, sanitizeUserId(userId));
  await migrateLegacyDataOnce(userRoot);

  const projectsDir = path.join(userRoot, 'projects');
  const dirsMetaFile = path.join(userRoot, 'directories.json');
  const myImagesDir = path.join(userRoot, 'my-images');

  await fs.mkdir(projectsDir, { recursive: true });
  await fs.mkdir(myImagesDir, { recursive: true });

  return { projectsDir, dirsMetaFile, myImagesDir };
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
  ipcMain.removeHandler('get-projects-path');
  ipcMain.removeHandler('open-projects-folder');
  ipcMain.removeHandler('create-dir');
  ipcMain.removeHandler('get-dirs');
  ipcMain.removeHandler('delete-dir');
  ipcMain.removeHandler('read-pdf-file');
  ipcMain.removeHandler('add-my-images');
  ipcMain.removeHandler('list-my-images');
  ipcMain.removeHandler('delete-my-image');
  ipcMain.removeHandler('get-my-images-path');
  ipcMain.removeHandler('open-my-images-folder');

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

  // The pdf-viewer iframe runs its own bundle loaded via file://, where the
  // browser's fetch()/XHR can't reliably read local files (especially from
  // a nested frame). Reading the bytes here via Node's fs and relaying them
  // to the renderer sidesteps that entirely.
  ipcMain.handle('read-pdf-file', async (event, filename) => {
    try {
      const safeName = path.basename(filename);
      const filepath = path.join(__dirname, 'pdf-viewer', 'docs', safeName);
      const data = await fs.readFile(filepath);
      return { success: true, data: new Uint8Array(data) };
    } catch (error) {
      log.error('Error reading PDF file:', error);
      return { success: false, error: error.message };
    }
  });

  //-------------------------------------
  // File system operations
  //-------------------------------------

  // Existing handlers
  ipcMain.handle('get-user-data-path', () => app.getPath('userData'));

  // Where project .json files (and their folders) are stored on disk
  ipcMain.handle('get-projects-path', async (event, userId) => {
    const { projectsDir } = await getUserPaths(userId);
    return projectsDir;
  });
  ipcMain.handle('open-projects-folder', async (event, userId) => {
    const { projectsDir } = await getUserPaths(userId);
    const error = await shell.openPath(projectsDir);
    return { success: !error, error: error || undefined };
  });

  // Project handlers
  ipcMain.handle('save-project', async (event, userId, data) => {
    try {
      const { projectsDir } = await getUserPaths(userId);
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
  
  ipcMain.handle('load-project', async (event, userId, filename) => {
    try {
      const { projectsDir } = await getUserPaths(userId);
      const filepath = path.join(projectsDir, filename);
      const data = await fs.readFile(filepath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      log.error('Error loading project:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-project', async (event, userId, filename) => {
    try {
      const { projectsDir } = await getUserPaths(userId);
      const filepath = path.join(projectsDir, filename);
      await fs.unlink(filepath);
      return { success: true };
    } catch (error) {
      log.error('Error deleting project:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('list-projects', async (event, userId, dirname) => {
    try {
      const { projectsDir } = await getUserPaths(userId);
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
  ipcMain.handle('create-dir', async (event, userId, dirname) => {
    try {
      const { projectsDir, dirsMetaFile } = await getUserPaths(userId);
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
  
  ipcMain.handle('get-dirs', async (event, userId) => {
    try {
      const { dirsMetaFile } = await getUserPaths(userId);
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
  
  ipcMain.handle('delete-dir', async (event, userId, dirname) => {
    try {
      const { projectsDir, dirsMetaFile } = await getUserPaths(userId);
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

  //-------------------------------------
  // "My Images" — user-uploaded images, shown as their own category in the
  // Add Image dialogue. Stored as plain files (not the bundled SVG library),
  // so they're displayed as-is with no fill-colour recolouring support.
  //-------------------------------------
  const toMyImageEntry = (filename) => ({
    filename,
    url: pathToFileURL(path.join(myImagesDir, filename)).href,
  });

  ipcMain.handle('add-my-images', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Add images',
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Images', extensions: MY_IMAGE_EXTENSIONS.map(ext => ext.slice(1)) }],
      });

      if (canceled || !filePaths.length) {
        return { success: true, added: [] };
      }

      await fs.mkdir(myImagesDir, { recursive: true });

      const added = [];
      for (const srcPath of filePaths) {
        const ext = path.extname(srcPath).toLowerCase();
        if (!MY_IMAGE_EXTENSIONS.includes(ext)) continue;
        const safeBase = path.basename(srcPath, path.extname(srcPath)).replace(/[^a-z0-9_-]/gi, '_');
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeBase}${ext}`;
        await fs.copyFile(srcPath, path.join(myImagesDir, filename));
        added.push(toMyImageEntry(filename));
      }

      return { success: true, added };
    } catch (error) {
      log.error('Error adding my-images:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('list-my-images', async () => {
    try {
      await fs.mkdir(myImagesDir, { recursive: true });
      const files = await fs.readdir(myImagesDir);
      const images = files
        .filter(filename => MY_IMAGE_EXTENSIONS.includes(path.extname(filename).toLowerCase()))
        .map(toMyImageEntry);
      return { success: true, images };
    } catch (error) {
      log.error('Error listing my-images:', error);
      return { success: false, error: error.message, images: [] };
    }
  });

  ipcMain.handle('delete-my-image', async (event, filename) => {
    try {
      const safeName = path.basename(filename);
      await fs.unlink(path.join(myImagesDir, safeName));
      return { success: true };
    } catch (error) {
      log.error('Error deleting my-image:', error);
      return { success: false, error: error.message };
    }
  });

  // Where "My Images" files are stored on disk
  ipcMain.handle('get-my-images-path', () => myImagesDir);
  ipcMain.handle('open-my-images-folder', async () => {
    await fs.mkdir(myImagesDir, { recursive: true }).catch(() => {});
    const error = await shell.openPath(myImagesDir);
    return { success: !error, error: error || undefined };
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




