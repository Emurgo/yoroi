/* eslint-disable @typescript-eslint/no-explicit-any */
import bluebird from 'bluebird'
import React from 'react'
import {createIntl, createIntlCache, IntlProvider} from 'react-intl'
import {AppRegistry, Text} from 'react-native'
import {Provider, useSelector} from 'react-redux'

import App from './App'
import {name as appName} from './app.json'
import translations from './i18n/translations'
import {handleGeneralError, setupHooks} from './legacy/actions'
import {CONFIG} from './legacy/config'
import getConfiguredStore from './legacy/configureStore'
import {setLogLevel} from './legacy/logging'
import {languageSelector} from './legacy/selectors'

setLogLevel(CONFIG.LOG_LEVEL)

bluebird.config({
  longStackTraces: true,
  warnings: true,
  cancellation: true,
})

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

const AppWithProviders = () => {
  return (
    <Provider store={store}>
      <IntlProviderWrapper>
        <App />
      </IntlProviderWrapper>
    </Provider>
  )
}

AppRegistry.registerComponent(appName, () => AppWithProviders)

const IntlProviderWrapper = (props) => {
  const locale = useSelector(languageSelector) || 'en-US'

  return <IntlProvider {...props} locale={locale} messages={translations[locale]} textComponent={Text} />
}
