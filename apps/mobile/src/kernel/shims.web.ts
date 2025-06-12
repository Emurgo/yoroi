import 'fast-text-encoding'

import {Buffer} from 'buffer'
import '../kernel/i18n/polyfills'

declare global {
  interface Window {
    Buffer: typeof Buffer
    TextEncoder: typeof TextEncoder
    TextDecoder: typeof TextDecoder
  }
}

global.Buffer = Buffer
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
window.Buffer = Buffer
window.TextEncoder = TextEncoder
window.TextDecoder = TextDecoder

export {}
