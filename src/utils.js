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

// Email-bound key:
//   key = base32( HMAC-SHA256(SECRET, normalize(email))[0..5] )
//   8 base32 chars, grouped as XXXX-XXXX (40-bit MAC)
// Deterministic — the same email always produces the same key.
// Note: SECRET lives in client code, so this is obfuscation-grade — a
// determined attacker with the bundle can still forge keys. For real
// unforgeability, sign keys server-side.
const KEY_SECRET = "ndp3-key-v1-7a2c9f3e8d4b6105";
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

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

const hmacSha256 = async (secret, data) => {
    const enc = new TextEncoder();
    const k = await crypto.subtle.importKey(
        "raw", enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
};

const constantTimeEqual = (a, b) => {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
};

const computeKeyMac = async (email) => {
    const data = new TextEncoder().encode(normalizeEmail(email));
    return (await hmacSha256(KEY_SECRET, data)).slice(0, 5);
};

export const generateKey = async (email) => {
    if (!normalizeEmail(email)) throw new Error("email required");
    const encoded = base32Encode(await computeKeyMac(email));
    return `${encoded.slice(0, 4)}-${encoded.slice(4, 8)}`;
};

export const validateKey = async (key, email) => {
    if (typeof key !== "string" || !normalizeEmail(email)) return false;
    const clean = key.replace(/[^A-Za-z2-7]/g, "");
    if (clean.length < 8) return false;
    const bytes = base32Decode(clean).slice(0, 5);
    if (bytes.length < 5) return false;
    const expected = await computeKeyMac(email);
    return constantTimeEqual(bytes, expected);
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

