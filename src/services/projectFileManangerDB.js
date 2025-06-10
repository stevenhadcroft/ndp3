import Dexie from 'dexie';
import { Constants } from "../constants";

window.LOCAL = 1;

let credentials = {userid:null, token:null};
window.REFRESH_CREDS = () => {
  credentials = JSON.parse(localStorage.getItem("NDP3Credentials"));
  console.log('credentials from localStorage ', credentials);  
}
window.REFRESH_CREDS();


const db = new Dexie("NDP3ProjectFiles_"+Constants.LOCAL_DATA_FILES_ID);
db.version(1).stores({ 
    projects: "++id,name,description,thumbnail,data,dirname",
    directories: "++id,dirname",
});
 
//------------------------------------------------
// PROJECT FUNCTIONS
//------------------------------------------------

export const storeProject = (params) => {
    const {name, projectid, description, thumbnail, data, dirname, orientation} = params;
    const file = {name, projectid, description, thumbnail, data, dirname, orientation};
    console.log('storeProject() file ', file);
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

export const getProject = async (file) => {
}

export const deleteProject = async (file) => {
    // alert(file)
    const existingFile = await db.projects.where({name:file.name}).first();
    return new Promise( async (resolve, reject) => {
        await db.projects.delete(existingFile.id);
        resolve();
	});
}

//------------------------------------------------
// DIRECTORY FUNCTIONS
//------------------------------------------------


export const createDir = (dirname) => {
    const file = {dirname};
    return new Promise( async (resolve, reject) => {
        await db.directories.add(file);
        resolve();
	});
}

export const getDirs = () => {
   return new Promise( async (resolve, reject) => {
        const directories = await db.directories.where("id").above(0).toArray();
        resolve({data:directories});
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

        // console.log('dirname ', dirname);
        // console.log('projects ', projects);
        // if (dirname){
        //     projects = projects.filter(proj => proj.dirname === dirname); 
        //     // console.log('dirname ', dirname);
        // } else {
        //     projects = projects.filter(proj => !proj.dirname); 
        // }
        
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


