import 'fast-text-encoding'
import {install} from 'react-native-quick-crypto'
import 'react-native-url-polyfill/auto'
import '../kernel/i18n/polyfills'

// NOTE: Buffer is shimmed here, but not to react-native-buffer
install()

export {}
