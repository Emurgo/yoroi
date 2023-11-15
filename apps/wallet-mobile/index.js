import './polyfills'
import 'react-native-url-polyfill/auto'
import 'react-native-gesture-handler' // required by react-navigation
import './global'
import './src/i18n/polyfills' // https://formatjs.io/docs/polyfills
import BigNumber from 'bignumber.js'

import {AppRegistry} from 'react-native'

import {name} from './app.json'
import {YoroiApp} from './src/YoroiApp'

BigNumber.config({DECIMAL_PLACES: 19, EXPONENTIAL_AT: [-10, 40]})
AppRegistry.registerComponent(name, () => YoroiApp)
