import './polyfills'
import 'react-native-gesture-handler' // required by react-navigation
import './global'
import './src/i18n/polyfills' // https://formatjs.io/docs/polyfills
import './src/index'

import {AppRegistry} from 'react-native'
import App from './src/App'
import {name as appName} from './app.json'

AppRegistry.registerComponent(appName, () => App)
