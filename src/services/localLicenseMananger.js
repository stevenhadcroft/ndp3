import Dexie from 'dexie';
 
// const db = new Dexie("NDP3LicenseFiles");
// db.version(1).stores({ licenses: "++id,name,status" });
 
export const linkMachine = async (userName) => {
    localStorage.setItem("NDP3LicenseFiles", "true");
    return;

    // const data = {status:"linked", name:userName};
    // db.transaction('rw', db.licenses, async() => {
    //     const existingLicense = await db.licenses.where(data).first();
    //     if (existingLicense){
    //         db.licenses.update(existingLicense.id, data)
    //             .then(res => {
    //                 console.log("linkMachine update ", res);
    //             });
            
    //     } else {
    //         db.licenses.add(data)
    //             .then(res => {
    //                 console.log("linkMachine() add ", res);
    //             });
    //     }
    // });
}

export const unlinkMachine = async (userName) => {
    localStorage.setItem("NDP3LicenseFiles", "false");
    return;

    // const data = {status:"linked", name:userName};
    // const existingLicense = await db.licenses.where(data).first();
    // if (existingLicense && existingLicense.id){
    //     db.licenses.delete(existingLicense.id);
    // }
}


export const checkLocalLicense = async (userName) => {
    return localStorage.getItem("NDP3LicenseFiles") === "true";

    // return new Promise( async (resolve, reject) => {
    //     const existingLicense = await db.licenses.where({status:"linked"}).first();
    //     resolve(existingLicense ? existingLicense : "unlinked");
	// });
}
