import {AppRegistry} from 'react-native'
import {BigNumber} from 'bignumber.js'
import {enableMapSet} from 'immer'

import {App} from './App'
import {name as appName} from './app.json'

enableMapSet()
BigNumber.config({DECIMAL_PLACES: 19, EXPONENTIAL_AT: [-10, 40]})

AppRegistry.registerComponent(appName, () => App)
