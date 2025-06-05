import {Buffer} from 'buffer'

import '../kernel/i18n/polyfills'

declare global {
  interface Window {
    Buffer: typeof Buffer
  }
}

global.Buffer = Buffer
window.Buffer = Buffer

export {}
