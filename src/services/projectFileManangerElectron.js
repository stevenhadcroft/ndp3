// import Dexie from 'dexie';
// import { Constants } from "../constants";

window.LOCAL = 1;

// let credentials = {userid:null, token:null};
// window.REFRESH_CREDS = () => {
//   credentials = JSON.parse(localStorage.getItem("NDP3Credentials"));
//   console.log('credentials from localStorage ', credentials);  
// }
// window.REFRESH_CREDS();


// const db = new Dexie("NDP3ProjectFiles_"+Constants.LOCAL_DATA_FILES_ID);
// db.version(1).stores({ 
//     projects: "++id,name,description,thumbnail,data,dirname",
//     directories: "++id,dirname",
// });
 
//------------------------------------------------
// PROJECT FUNCTIONS
//------------------------------------------------

export const storeProject = (params) => {
    const {name, projectid, description, thumbnail, data, dirname, orientation} = params;
    const file = {name, projectid, description, thumbnail, data, dirname, orientation};
    console.log('storeProject() file ', file);
    
    return new Promise(async (resolve, reject) => {
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.saveProject(file);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        } else {
            reject(new Error('electronAPI not available'));
        }
    });
}

export const getProject = async (file) => {
    if (window.electronAPI) {
        try {
            let filename = file.name;
            if (file.dirname) {
                filename = `${file.dirname}/${file.name}.json`;
            } else {
                filename = `${file.name}.json`;
            }
            
            const result = await window.electronAPI.loadProject(filename);
            if (result.success) {
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error loading project:', error);
            return null;
        }
    }
    return null;
}

export const deleteProject = async (file) => {
    return new Promise(async (resolve, reject) => {
        if (window.electronAPI) {
            try {
                let filename = file.name;
                if (file.dirname) {
                    filename = `${file.dirname}/${file.name}.json`;
                } else {
                    filename = `${file.name}.json`;
                }
                
                const result = await window.electronAPI.deleteProject(filename);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        } else {
            reject(new Error('electronAPI not available'));
        }
    });
}

export const getProjectList = async (dirname) => {
    if (window.electronAPI) {
        try {
            const [projectsResult, dirsResult] = await Promise.all([
                window.electronAPI.listProjects(dirname),
                window.electronAPI.getDirs()
            ]);
            
            // let projects = projectsResult.success ? projectsResult.projects : [];
            // const directories = dirsResult.success ? dirsResult.directories : [];
            
            // // Filter by directory if needed
            // if (dirname) {
            //     projects = projects.filter(proj => proj.dirname === dirname);
            // }
            
            // return { projects, directories };
            return { projects:projectsResult, directories:dirsResult };
            
        } catch (error) {
            console.error('Error getting project list:', error);
            return { projects: [], directories: [] };
        }
    }
    return { projects: [], directories: [] };
}

//------------------------------------------------
// DIRECTORY FUNCTIONS
//------------------------------------------------

export const createDir = (dirname) => {
    return new Promise(async (resolve, reject) => {
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.createDir(dirname);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        } else {
            reject(new Error('electronAPI not available'));
        }
    });
}

export const getDirs = async () => {
    if (window.electronAPI) {
        try {
            const result = await window.electronAPI.getDirs();
            if (result.success) {
                return result.directories.map(d => ({
                    dirname: d.dirname,
                    createdAt: d.createdAt
                }));
            }
            return [];
        } catch (error) {
            console.error('Error getting directories:', error);
            return [];
        }
    }
    return [];
}

export const deleteDir = async (dirname) => {
    return new Promise(async (resolve, reject) => {
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.deleteDir(dirname);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        } else {
            reject(new Error('electronAPI not available'));
        }
    });
}
