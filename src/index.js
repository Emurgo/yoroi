// @flow
import React from 'react'
import {AppRegistry, Text} from 'react-native'
import {addLocaleData, IntlProvider, type IntlShape} from 'react-intl'
import en from 'react-intl/locale-data/en'
import ja from 'react-intl/locale-data/ja'
import ko from 'react-intl/locale-data/ko'
import ru from 'react-intl/locale-data/ru'
import es from 'react-intl/locale-data/es'
import zh from 'react-intl/locale-data/zh'
import id from 'react-intl/locale-data/id'
import pt from 'react-intl/locale-data/pt'
import de from 'react-intl/locale-data/de'
import fr from 'react-intl/locale-data/fr'
import it from 'react-intl/locale-data/it'
import nl from 'react-intl/locale-data/nl'
import cs from 'react-intl/locale-data/cs'
import hu from 'react-intl/locale-data/hu'
import sk from 'react-intl/locale-data/sk'

import {connect, Provider} from 'react-redux'

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

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([
  ...en,
  ...ja,
  ...ko,
  ...ru,
  ...es,
  ...zh,
  ...id,
  ...pt,
  ...de,
  ...fr,
  ...it,
  ...nl,
  ...cs,
  ...hu,
  ...sk,
])

/*
  Warning(ppershing): DO NOT EVER REMOVE FOLLOWING LINE!
  React-native promise implementation is totally broken, see
  https://github.com/facebook/react-native/issues/19490
  https://github.com/facebook/react-native/issues/17972
*/
global.Promise = bluebird

const intlProvider = new IntlProvider({
  locale: 'en-US',
  messages: translations['en-US'],
})
const {intl}: {intl: IntlShape} = intlProvider.getChildContext()
global.onunhandledrejection = (e) => handleGeneralError(e.message, e, intl)

const store = getConfiguredStore()

store.dispatch(setupHooks())
// TODO: this is async action, we should wait for it in future

const IntlProviderWrapper = connect((state) => {
  const locale = languageSelector(state) || 'en-US'
  return {
    locale,
    messages: translations[locale],
    textComponent: Text,
  }
})(IntlProvider)

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
