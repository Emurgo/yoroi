// polyfills decodeUnsafe. Points at the real bech32 entry file.

const real = require('bech32/dist/index.js') // ⬅️ bech32@2.0.0 entry

// Normalize possible shapes: {bech32, bech32m} or flat/default export.
const root = real?.bech32 || real?.default || real || {}
const bech32 = {...root}

const pick = (k) => bech32[k] || real[k] || (real.bech32 && real.bech32[k])

bech32.encode = bech32.encode || pick('encode')
bech32.decode = bech32.decode || pick('decode')
bech32.toWords = bech32.toWords || pick('toWords')
bech32.fromWords = bech32.fromWords || pick('fromWords')

// Polyfill decodeUnsafe so legacy callers won't crash.
if (!bech32.decodeUnsafe && bech32.decode) {
  bech32.decodeUnsafe = (str, limit) => {
    try {
      return bech32.decode(str, limit)
    } catch {
      return undefined
    }
  }
}

const bech32m = real.bech32m || bech32

// Export in ALL expected shapes (named + default)
const normalized = {
  bech32,
  bech32m,
  toWords: bech32.toWords,
  fromWords: bech32.fromWords,
}
normalized.default = normalized

module.exports = normalized
