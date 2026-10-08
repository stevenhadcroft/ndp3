// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  callPrintFunction: (htmlContent) => ipcRenderer.invoke('call-print', htmlContent),
  closeApp: () => ipcRenderer.send('close-app'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  readPdfFile: (filename) => ipcRenderer.invoke('read-pdf-file', filename),
  // onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateProgress: (callback) => ipcRenderer.on('download-progress', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', callback),
  // onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  // downloadUpdate: () => ipcRenderer.invoke('download-update')

  // File system operations
  // `userId` scopes storage to the currently signed-in user (see
  // src/services/localLicenseMananger.js getCurrentUser()) so different
  // people signing in on the same machine don't share saved projects/images.
  saveProject: (userId, data) => ipcRenderer.invoke('save-project', userId, data),
  loadProject: (userId, filename) => ipcRenderer.invoke('load-project', userId, filename),
  deleteProject: (userId, filename) => ipcRenderer.invoke('delete-project', userId, filename),
  listProjects: (userId, dirname) => {
    console.log('Invoking list-projects');
    return ipcRenderer.invoke('list-projects', userId, dirname)
  },
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  getProjectsPath: (userId) => ipcRenderer.invoke('get-projects-path', userId),
  openProjectsFolder: (userId) => ipcRenderer.invoke('open-projects-folder', userId),

   // Directory operations
  createDir: (userId, dirname) => ipcRenderer.invoke('create-dir', userId, dirname),
  getDirs: (userId) => ipcRenderer.invoke('get-dirs', userId),
  deleteDir: (userId, dirname) => ipcRenderer.invoke('delete-dir', userId, dirname),

  // "My Images" - user-uploaded images
  addMyImages: (userId) => ipcRenderer.invoke('add-my-images', userId),
  listMyImages: (userId) => ipcRenderer.invoke('list-my-images', userId),
  deleteMyImage: (userId, filename) => ipcRenderer.invoke('delete-my-image', userId, filename),
  getMyImagesPath: (userId) => ipcRenderer.invoke('get-my-images-path', userId),
  openMyImagesFolder: (userId) => ipcRenderer.invoke('open-my-images-folder', userId)
});