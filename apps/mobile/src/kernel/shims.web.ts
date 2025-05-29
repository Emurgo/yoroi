import {Buffer} from 'buffer'

declare global {
  interface Window {
    Buffer: typeof Buffer
  }
}

global.Buffer = Buffer
window.Buffer = Buffer

export {}
