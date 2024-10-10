import './polyfills'
import './global'

import 'react-native-gesture-handler' // required by react-navigation
import BigNumber from 'bignumber.js'
import {enableMapSet} from 'immer'
import {AppRegistry} from 'react-native'

import {name} from './app.json'
import {YoroiApp} from './src/YoroiApp'

enableMapSet()
BigNumber.config({DECIMAL_PLACES: 19, EXPONENTIAL_AT: [-10, 40]})
AppRegistry.registerComponent(name, () => YoroiApp)
