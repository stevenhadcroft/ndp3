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
  saveProject: (data) => ipcRenderer.invoke('save-project', data),
  loadProject: (filename) => ipcRenderer.invoke('load-project', filename),
  deleteProject: (filename) => ipcRenderer.invoke('delete-project', filename),
  listProjects: (dirname) => {
    console.log('Invoking list-projects');
    return ipcRenderer.invoke('list-projects', dirname)
  },
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  getProjectsPath: () => ipcRenderer.invoke('get-projects-path'),
  openProjectsFolder: () => ipcRenderer.invoke('open-projects-folder'),

   // Directory operations
  createDir: (dirname) => ipcRenderer.invoke('create-dir', dirname),
  getDirs: () => ipcRenderer.invoke('get-dirs'),
  deleteDir: (dirname) => ipcRenderer.invoke('delete-dir', dirname)
});