import {Buffer} from 'buffer'
import 'react-native-url-polyfill/auto'
import './src/kernel/i18n/polyfills' // https://formatjs.io/docs/polyfills

Object.fromEntries = Object.fromEntries || ((arr) => arr.reduce((acc, [k, v]) => ((acc[k] = v), acc), {}))

Buffer.prototype.subarray = function subarray(start, end) {
  const newBuf = Uint8Array.prototype.subarray.call(this, start, end)
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

export {}
