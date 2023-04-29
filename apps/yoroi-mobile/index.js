import './polyfills'
import 'react-native-gesture-handler' // required by react-navigation
import './global'
import './src/i18n/polyfills' // https://formatjs.io/docs/polyfills

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react'
import {AppRegistry} from 'react-native'

import {name} from './app.json'
import {YoroiApp} from './src/YoroiApp'

console.log(YoroiApp)

AppRegistry.registerComponent(name, () => YoroiApp)
