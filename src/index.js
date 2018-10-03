/** @format */
import React from 'react'

import {AppRegistry} from 'react-native'
import App from './App'
import {name as appName} from './app.json'
import {Provider} from 'react-redux'
import getConfiguredStore from './helpers/configureStore'


const store = getConfiguredStore()
const AppWithStore = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

AppRegistry.registerComponent(appName, () => AppWithStore)
