import { getCurrentUser } from './localLicenseMananger';

window.LOCAL = 1;

// ~/Library/Application Support/<app-name>/users/<user>/projects/

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
                const result = await window.electronAPI.saveProject(getCurrentUser(), file);
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
            
            const result = await window.electronAPI.loadProject(getCurrentUser(), filename);
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
                
                const result = await window.electronAPI.deleteProject(getCurrentUser(), filename);
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
            const userId = getCurrentUser();
            const [projectsResult, dirsResult] = await Promise.all([
                window.electronAPI.listProjects(userId, dirname),
                window.electronAPI.getDirs(userId)
            ]);

            let projects = projectsResult.success ? projectsResult.projects : [];
            const directories = dirsResult.success ? dirsResult.directories : [];

            // Filter by directory if needed
            // if (dirname) {
            //     projects = projects.filter(proj => proj.dirname === dirname);
            // }

            return { projects, directories };
            
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
                const result = await window.electronAPI.createDir(getCurrentUser(), dirname);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        } else {
            reject(new Error('electronAPI not available'));
        }
    });
}

export const getDirs = () => {
    return new Promise(async (resolve, reject) => {
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.getDirs(getCurrentUser());
                if (result.success) {
                    const directories = result.directories.map(d => ({
                        dirname: d.dirname,
                        createdAt: d.createdAt
                    }));
                    resolve({data: directories});
                } else {
                    resolve({data: []});
                }
            } catch (error) {
                console.error('Error getting directories:', error);
                resolve({data: []});
            }
        } else {
            resolve({data: []});
        }
    });
}

export const deleteDir = async (file) => {
    return new Promise(async (resolve, reject) => {
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.deleteDir(getCurrentUser(), file.dirname);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        } else {
            reject(new Error('electronAPI not available'));
        }
    });
}
