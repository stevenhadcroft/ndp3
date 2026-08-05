// Electron 36's bundled Chromium (136) predates Uint8Array.prototype.toHex/
// fromHex (a recent TC39 addition), which pdf.js relies on when computing a
// PDF's fingerprint from its trailer /ID. Without this, parsing throws
// "TypeError: ...toHex is not a function" for any PDF with a valid /ID entry.
if (typeof Uint8Array.prototype.toHex !== 'function') {
  Uint8Array.prototype.toHex = function () {
    let hex = ''
    for (let i = 0; i < this.length; i++) {
      hex += this[i].toString(16).padStart(2, '0')
    }
    return hex
  }
}

if (typeof Uint8Array.fromHex !== 'function') {
  Uint8Array.fromHex = function (hex) {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }
    return bytes
  }
}

// Same Electron/Chromium 136 gap for the "Map upsert" proposal
// (Map.prototype.getOrInsert/getOrInsertComputed), which pdf.js uses for its
// optional content config cache.
for (const Ctor of [Map, WeakMap]) {
  if (typeof Ctor.prototype.getOrInsert !== 'function') {
    Ctor.prototype.getOrInsert = function (key, value) {
      if (this.has(key)) return this.get(key)
      this.set(key, value)
      return value
    }
  }
  if (typeof Ctor.prototype.getOrInsertComputed !== 'function') {
    Ctor.prototype.getOrInsertComputed = function (key, callbackFn) {
      if (this.has(key)) return this.get(key)
      const value = callbackFn(key)
      this.set(key, value)
      return value
    }
  }
}
