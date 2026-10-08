import Dexie from 'dexie';
import { TRIAL_DAYS_BY_DIGIT, normalizeEmail } from '../utils';
// Imported directly from the leaf module (not the `../constants` aggregate)
// to avoid a circular import: constants/unlocks.js pulls in this file, and
// constants/index.js pulls in unlocks.js, so going through the aggregate
// here would reference `Constants` before it's initialized.
import { LOCAL_DATA_CONFIG } from '../constants/storage';

const DAY_MS = 24 * 60 * 60 * 1000;

// const db = new Dexie("NDP3LicenseFiles");
// db.version(1).stores({ licenses: "++id,name,status" });

// Trials, unlocks and the licence flag are all scoped to a single user
// (identified by the email/username entered at sign-in) so that different
// people signing in on the same machine don't share - or reset - each
// other's trial windows and unlock counts.
//
// The active user is remembered under a fixed (non-namespaced) key so that
// calls made without an explicit `userName` (e.g. on app boot, before the
// sign-in screen has run) still resolve to whoever last signed in.
const CURRENT_USER_KEY = `${LOCAL_DATA_CONFIG}currentUser`;

const setCurrentUser = (userName) => {
    const user = normalizeEmail(userName);
    if (user) localStorage.setItem(CURRENT_USER_KEY, user);
}

export const getCurrentUser = () => localStorage.getItem(CURRENT_USER_KEY) || "";

// Builds the per-user key prefix. Falls back to the last remembered user
// when `userName` isn't passed, and to a shared "anonymous" bucket if no
// user has ever been recorded.
const userPrefix = (userName) => {
    const user = normalizeEmail(userName) || getCurrentUser() || "anonymous";
    return `${LOCAL_DATA_CONFIG}${user}_`;
}

export const linkMachine = async (userName) => {
    setCurrentUser(userName);
    localStorage.setItem(`${userPrefix(userName)}NDP3LicenseFiles`, "true");
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
    localStorage.setItem(`${userPrefix(userName)}NDP3LicenseFiles`, "false");
    return;

    // const data = {status:"linked", name:userName};
    // const existingLicense = await db.licenses.where(data).first();
    // if (existingLicense && existingLicense.id){
    //     db.licenses.delete(existingLicense.id);
    // }
}


export const checkLocalLicense = async (userName) => {
    return localStorage.getItem(`${userPrefix(userName)}NDP3LicenseFiles`) === "true";

    // return new Promise( async (resolve, reject) => {
    //     const existingLicense = await db.licenses.where({status:"linked"}).first();
    //     resolve(existingLicense ? existingLicense : "unlinked");
	// });
}

// The unlock number decoded from the user's licence key (see validateKey in
// utils.js). Used to lock/unlock the PDF viewers and Speech Builder entries
// in the side menu: locked when 0 (or unset), unlocked when higher than 0.
export const saveUnlockCount = (count, userName) => {
    const num = Number.isFinite(count) ? count : parseInt(count, 10) || 0;
    localStorage.setItem(`${userPrefix(userName)}NDP3UnlockCount`, String(num));
}

export const loadUnlockCount = (userName) => {
    const num = parseInt(localStorage.getItem(`${userPrefix(userName)}NDP3UnlockCount`), 10);
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
export const getTrialDaysLeft = (productIndex, digit, userName) => {
    const days = TRIAL_DAYS_BY_DIGIT[digit];
    if (!days) return null;

    const prefix = userPrefix(userName);
    const endKey = `${prefix}endTrialDate_${productIndex}`;
    const digitKey = `${prefix}trialDigit_${productIndex}`;

    let end = parseInt(localStorage.getItem(endKey), 10);
    const storedDigit = parseInt(localStorage.getItem(digitKey), 10);

    if (!Number.isFinite(end) || storedDigit !== digit) {
        const start = Date.now();
        end = start + days * DAY_MS;
        localStorage.setItem(`${prefix}startTrialDate_${productIndex}`, String(start));
        localStorage.setItem(endKey, String(end));
        localStorage.setItem(digitKey, String(digit));
    }

    return Math.max(0, Math.ceil((end - Date.now()) / DAY_MS));
}
