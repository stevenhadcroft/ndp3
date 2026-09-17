import Dexie from 'dexie';
import { TRIAL_DAYS_BY_DIGIT } from '../utils';

const DAY_MS = 24 * 60 * 60 * 1000;
 
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

// The unlock number decoded from the user's licence key (see validateKey in
// utils.js). Used to lock/unlock the PDF viewers and Speech Builder entries
// in the side menu: locked when 0 (or unset), unlocked when higher than 0.
export const saveUnlockCount = (count) => {
    const num = Number.isFinite(count) ? count : parseInt(count, 10) || 0;
    localStorage.setItem("NDP3UnlockCount", String(num));
}

export const loadUnlockCount = () => {
    const num = parseInt(localStorage.getItem("NDP3UnlockCount"), 10);
    return Number.isFinite(num) ? num : 0;
}

// Trial windows for time-limited product activations (licence digits 1-4,
// see TRIAL_DAYS_BY_DIGIT in utils.js). `productIndex` matches the licence
// digit's position (0 = Speech Builder, 1-4 = PDF_VIEWERS in order).
//
// The window is created the first time a given digit is seen for that
// product - start/end timestamps are stashed in localStorage so the trial
// keeps counting down across app restarts - and restarted if the digit
// later changes (e.g. a renewed key with a different duration).
//
// Returns whole days remaining (0 once expired), or null if `digit` isn't
// one of the time-limited durations (locked, unlimited, or unset).
export const getTrialDaysLeft = (productIndex, digit) => {
    const days = TRIAL_DAYS_BY_DIGIT[digit];
    if (!days) return null;

    const endKey = `endTrialDate_${productIndex}`;
    const digitKey = `trialDigit_${productIndex}`;

    let end = parseInt(localStorage.getItem(endKey), 10);
    const storedDigit = parseInt(localStorage.getItem(digitKey), 10);

    if (!Number.isFinite(end) || storedDigit !== digit) {
        const start = Date.now();
        end = start + days * DAY_MS;
        localStorage.setItem(`startTrialDate_${productIndex}`, String(start));
        localStorage.setItem(endKey, String(end));
        localStorage.setItem(digitKey, String(digit));
    }

    return Math.max(0, Math.ceil((end - Date.now()) / DAY_MS));
}
