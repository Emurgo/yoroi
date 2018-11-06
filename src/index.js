/** @format */
import React from 'react'
import {AppRegistry} from 'react-native'
import App from './App'
import {name as appName} from './app.json'
import {Provider} from 'react-redux'
import getConfiguredStore from './helpers/configureStore'
import {loadLanguage, setupHooks, initAppIfNeeded} from './actions'

import bluebird from 'bluebird'

bluebird.config({
  longStackTraces: true,
  warnings: true,
})

/*
  Warning(ppershing): DO NOT EVER REMOVE FOLLOWING LINE!
  React-native promise implementation is totally broken, see
  https://github.com/facebook/react-native/issues/19490
  https://github.com/facebook/react-native/issues/17972
*/
global.Promise = bluebird

const store = getConfiguredStore()

store.dispatch(setupHooks())
// TODO: this is async action, we should wait for it in future
store.dispatch(loadLanguage())
store.dispatch(initAppIfNeeded())

const AppWithStore = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

AppRegistry.registerComponent(appName, () => AppWithStore)
