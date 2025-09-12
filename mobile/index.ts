/* prettier-ignore-file */
import {registerRootComponent} from 'expo'
import 'react-native-gesture-handler'

import App from './App'
import './src/kernel/logger/helpers/init-logger'
import './src/kernel/shims'

registerRootComponent(App)
