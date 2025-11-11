import Dexie from 'dexie';
import { Constants } from "../constants";

const db = new Dexie("NDP3ProjectFiles_"+Constants.LOCAL_DATA_FILES_ID);
db.version(1).stores({ 
    projects: "++id,name,description,thumbnail,data,dirname",
    directories: "++id,dirname",
});
 
export const storeProject = (name, description, thumbnail, data, dirname) => {
    const file = {name, description, thumbnail, data, dirname};
    // console.log('storeProject() file ', file);
    return new Promise((resolve, reject) => {
        db.transaction('rw', db.projects, async() => {
            const existingFile = await db.projects.where({name}).first();
            if (existingFile){
                await db.projects.update(existingFile.id, file);
            } else {
                await db.projects.add(file);
            }
        });
	});
}

export const createDir = (dirname) => {
    const file = {dirname};
    return new Promise( async (resolve, reject) => {
        await db.directories.add(file);
        resolve();
	});
}

export const deleteProject = async (file) => {
    // alert(file)
    const existingFile = await db.projects.where({name:file.name}).first();
    return new Promise( async (resolve, reject) => {
        await db.projects.delete(existingFile.id);
        resolve();
	});
}

export const deleteDir = async (file) => {
    // alert(file)
    const existingFile = await db.directories.where({dirname:file.dirname}).first();
    return new Promise( async (resolve, reject) => {
        await db.directories.delete(existingFile.id);
        resolve();
	});
}

export const getProjectList = (dirname) => {
    return new Promise( async (resolve, reject) => {
        let projects = await db.projects.where("id").above(0).toArray();

        console.log('dirname ', dirname);
        console.log('projects ', projects);
        if (dirname){
            projects = projects.filter(proj => proj.dirname === dirname); 
            // console.log('dirname ', dirname);
        } else {
            projects = projects.filter(proj => !proj.dirname); 
        }
        
        console.log('>>> projects ', projects);
        const directories = await db.directories.where("id").above(0).toArray();
        resolve({projects,directories});
	});
}

// export const storeImageColouring = (imageId, data) => {
//     const file = {name:imageId, data};
//     console.log('storeImageColouring() file ', file);
//     return new Promise((resolve, reject) => {
//         db.transaction('rw', db.projects, async() => {
//             const existingFile = await db.projects.where({name:imageId}).first();
//             if (existingFile){
//                 await db.projects.update(existingFile.id, file);
//             } else {
//                 await db.projects.add(file);
//             }
//         });
// 	});
// }


