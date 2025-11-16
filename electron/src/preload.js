// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  callPrintFunction: (htmlContent) => ipcRenderer.invoke('call-print', htmlContent),
  closeApp: () => ipcRenderer.send('close-app'),
  // onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateProgress: (callback) => ipcRenderer.on('download-progress', callback),
  // onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  // getVersion: () => ipcRenderer.invoke('get-version'),
  // downloadUpdate: () => ipcRenderer.invoke('download-update')
});
