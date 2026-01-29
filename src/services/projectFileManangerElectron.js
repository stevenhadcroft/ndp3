window.LOCAL = 1;

// ~/Library/Application Support/<app-name>/projects/
 
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

export const getDirs = () => {
    return new Promise(async (resolve, reject) => {
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.getDirs();
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
                const result = await window.electronAPI.deleteDir(file.dirname);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        } else {
            reject(new Error('electronAPI not available'));
        }
    });
}
