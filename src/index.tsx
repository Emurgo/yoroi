/* eslint-disable @typescript-eslint/no-explicit-any */
import bluebird from 'bluebird'
import React from 'react'
import {createIntl, createIntlCache} from 'react-intl'
import {AppRegistry, LogBox} from 'react-native'
import {QueryClient, QueryClientProvider} from 'react-query'
import {Provider} from 'react-redux'

import App from './App'
import {name as appName} from './app.json'
import {Boundary} from './components'
import {LanguageProvider} from './i18n'
import translations from './i18n/translations'
import {handleGeneralError, setupHooks} from './legacy/actions'
import {CONFIG} from './legacy/config'
import getConfiguredStore from './legacy/configureStore'
import {setLogLevel} from './legacy/logging'

setLogLevel(CONFIG.LOG_LEVEL)

bluebird.config({
  longStackTraces: false,
  warnings: false,
  cancellation: true,
})

LogBox.ignoreLogs([
  // react navigation didn't port everything
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  // react-query default cacheTime (not an issue)
  'Setting a timer for a long period of time, i.e. multiple minutes, is a performance and correctness issue on Android as it keeps the timer module awake, and timers can only be called when the app is in the foreground. See https://github.com/facebook/react-native/issues/12981 for more info.',
  // react navigation fix old params
  'Non-serializable values were found in the navigation state.',
])

/*
  Warning(ppershing): DO NOT EVER REMOVE FOLLOWING LINE!
  React-native promise implementation is totally broken, see
  https://github.com/facebook/react-native/issues/19490
  https://github.com/facebook/react-native/issues/17972
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.Promise = bluebird as any

const cache = createIntlCache()
const intl = createIntl({locale: 'en-US', messages: translations['en-US']}, cache)
global.onunhandledrejection = (e) => handleGeneralError((e as any).message, e as any, intl)

const store = getConfiguredStore()
store.dispatch(setupHooks() as any)

const queryClient = new QueryClient()

const AppWithProviders = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Boundary>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </Boundary>
      </QueryClientProvider>
    </Provider>
  )
}

AppRegistry.registerComponent(appName, () => AppWithProviders)
