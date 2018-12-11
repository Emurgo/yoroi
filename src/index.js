// @flow
import React from 'react'
import {AppRegistry} from 'react-native'
import App from './App'
import {name as appName} from './app.json'
// $FlowFixMe flow does not have this import
import {Provider} from 'react-redux'
import getConfiguredStore from './helpers/configureStore'
import {setupHooks, handleGeneralError} from './actions'
import {setLogLevel} from './utils/logging'
import {CONFIG} from './config'

import bluebird from 'bluebird'

setLogLevel(CONFIG.LOG_LEVEL)

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

global.onunhandledrejection = (e) => handleGeneralError(e.message, e)

const store = getConfiguredStore()

store.dispatch(setupHooks())
// TODO: this is async action, we should wait for it in future

const AppWithStore = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

AppRegistry.registerComponent(appName, () => AppWithStore)
