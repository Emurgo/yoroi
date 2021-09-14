// @flow

import React from 'react'
import {AppRegistry, Text} from 'react-native'
import {IntlProvider} from 'react-intl'
import {createIntl, createIntlCache} from '@formatjs/intl'
import {Provider, useSelector} from 'react-redux'

import App from './App'
import {name as appName} from './app.json'

import getConfiguredStore from './helpers/configureStore'
import {setupHooks, handleGeneralError} from './actions'
import {languageSelector} from './selectors'
import {setLogLevel} from './utils/logging'
import {CONFIG} from './config/config'
import translations from './i18n/translations'
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

const cache = createIntlCache()
const intl = createIntl({locale: 'en-US', messages: translations['en-US']}, cache)
global.onunhandledrejection = (e) => handleGeneralError(e.message, e, intl)

const store = getConfiguredStore()

store.dispatch(setupHooks())
// TODO: this is async action, we should wait for it in future

const IntlProviderWrapper = (props) => {
  const locale = useSelector(languageSelector) || 'en-US'

  return <IntlProvider {...props} locale={locale} messages={translations[locale]} textComponent={Text} />
}

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
