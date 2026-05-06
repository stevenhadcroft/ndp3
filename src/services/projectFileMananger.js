import * as electron from './projectFileManangerElectron';
import * as db from './projectFileManangerDB';

const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

const backend = isElectron ? electron : db;

export const mode = isElectron ? 'electron' : 'local';

export const {
    storeProject,
    getProject,
    getProjectList,
    deleteProject,
    createDir,
    deleteDir,
    getDirs,
} = backend;
