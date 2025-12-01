import 'fast-text-encoding'
import {install} from 'react-native-quick-crypto'
import 'react-native-url-polyfill/auto'
import {Buffer} from '@craftzdog/react-native-buffer'

import '../kernel/i18n/polyfills'

// NOTE: Buffer is shimmed here, but not to react-native-buffer
install()

// Ensure Buffer is available globally for libraries like int64-buffer
// that check for typeof Buffer
// This runs early in index.ts, before most modules load
// The int64-buffer patch (patches/int64-buffer+1.0.1.patch) provides
// fallback checks for global.Buffer if typeof Buffer fails
if (typeof global !== 'undefined' && !global.Buffer) {
  global.Buffer = Buffer
}
if (typeof globalThis !== 'undefined' && !globalThis.Buffer) {
  globalThis.Buffer = Buffer
}

export {}
