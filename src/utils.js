const clone = (item) => {
    if (!item) { return item; } // null, undefined values check

    var types = [Number, String, Boolean],
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function (type) {
        if (item instanceof type) {
            result = type(item);
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call(item) === "[object Array]") {
            result = [];
            item.forEach(function (child, index, array) {
                result[index] = clone(child);
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                result = item.cloneNode(true);
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = clone(item[i]);
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}

export const cloneDeep = clone;

export const makeSVGgrabbable = (view) => {
    // make svgs grabbable
    // but setting these w/h distorts the svg of rotated
    // therefore we need to remove rotate, set w/h, then reapply rotate
    let svgElements = document.body.querySelectorAll('svg');
    svgElements.forEach(function (item) {
        const rot = item.parentElement.style.transform;
        item.parentElement.style.transform = "rotate(0deg)";
        item.setAttribute("width", item.getBoundingClientRect().width / view.canvasScale);
        item.setAttribute("height", item.getBoundingClientRect().height / view.canvasScale);
        item.parentElement.style.transform = rot;
    });
}

export const makeSVGgrabbableReset = () => {
    // set back to 100% - otherwith scaling in app doesn't work
    let svgElements = document.body.querySelectorAll('svg');
    svgElements.forEach(function (item) {
        item.setAttribute("width", "100%");
        item.setAttribute("height", "100%");
    });
}

// Two-way (reversible) key scheme — ported from keyTools/twoWay/*.html,
// which is where this is designed, tested and documented in full. Keep this
// block in sync with keyTools/twoWay/generateKey.html, validateKey.html and
// decodeKey.html.
//
// Payload is fixed at 7 bytes, always exactly 12 base32 characters (3 dash
// groups of 4, e.g. IFKU-CAQ4-LJFA):
//   bytes 0-2  the unlock number (0-99999), packed big-endian — this
//              round-trips exactly, every time.
//   bytes 3-6  a 32-bit fingerprint (FNV-1a) of the normalised email — NOT
//              reversible. It only lets us check whether a *candidate*
//              email matches; the email itself can't be read back.
// The 7 bytes are XORed with a keystream derived from KEY_SECRET before
// base32 encoding (light obfuscation, not real encryption — KEY_SECRET
// lives in client code, so a determined attacker with the bundle can still
// forge keys; for real unforgeability, sign/verify keys server-side).
const KEY_SECRET = "ndp3-key-v1-7a2c9f3e8d4b6105";
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const MAX_UNLOCK_NUMBER = 99999;
const KEY_CHARS = 12; // 7 bytes of base32, always this many characters

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const base32Encode = (bytes) => {
    let bits = 0, value = 0, out = "";
    for (const b of bytes) {
        value = (value << 8) | b;
        bits += 8;
        while (bits >= 5) {
            out += BASE32[(value >> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
    return out;
};

const base32Decode = (str) => {
    const bytes = [];
    let bits = 0, value = 0;
    for (const ch of str.toUpperCase()) {
        const idx = BASE32.indexOf(ch);
        if (idx < 0) continue;
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return new Uint8Array(bytes);
};

const secretBytes = new TextEncoder().encode(KEY_SECRET);
const xorWithSecret = (bytes) => bytes.map((b, i) => b ^ secretBytes[i % secretBytes.length]);

const fnv1a32 = (bytes) => {
    let hash = 0x811c9dc5;
    for (const b of bytes) {
        hash ^= b;
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
};

const packNumber = (num) => new Uint8Array([(num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff]);
const unpackNumber = (bytes) => (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
const packUint32 = (n) => new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
const toHex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const fingerprintOf = (email) => toHex(packUint32(fnv1a32(new TextEncoder().encode(normalizeEmail(email)))));

export const generateKey = (number, email) => {
    const num = parseInt(number, 10);
    if (!Number.isInteger(num) || num < 0 || num > MAX_UNLOCK_NUMBER) throw new Error("number must be 0-99999");
    if (!normalizeEmail(email)) throw new Error("email required");
    const payload = new Uint8Array(7);
    payload.set(packNumber(num), 0);
    payload.set(packUint32(fnv1a32(new TextEncoder().encode(normalizeEmail(email)))), 3);
    return (base32Encode(xorWithSecret(payload)).match(/.{1,4}/g) || []).join("-");
};

// Decodes `key` and, if `email` is supplied, checks it against the key's
// embedded email fingerprint. Returns `{ number }` on success (the unlock
// number the key was made for) or `false` on failure — so the existing
// `if (!(await validateKey(...)))` call sites keep working unchanged, while
// a successful result also carries the number to persist/unlock with.
export const validateKey = (key, email) => {
    if (typeof key !== "string") return false;
    const clean = key.replace(/[^A-Za-z2-7]/g, "");
    if (clean.length !== KEY_CHARS) return false;

    const bytes = xorWithSecret(base32Decode(clean));
    if (bytes.length !== 7) return false;

    const num = unpackNumber(bytes.subarray(0, 3));
    if (num > MAX_UNLOCK_NUMBER) return false;

    const enteredEmail = normalizeEmail(email);
    if (enteredEmail && fingerprintOf(enteredEmail) !== toHex(bytes.subarray(3, 7))) return false;

    return { number: num };
};



export const getHighestZdepth = (arr) => {
    return Math.max.apply(Math,
        arr.map(function (o) {
            return o.zIndex + 1;
        })
    );
};


export const isElectron = () => {
    return typeof process !== 'undefined' &&
        typeof process.versions === 'object' &&
        !!process.versions.electron;
}

export const isElectronRenderer = () =>
            typeof window !== 'undefined' &&
            typeof window.process === 'object' &&
            window.process.type === 'renderer';

