// @flow

import bluebird from 'bluebird'
import React from 'react'
import {type IntlShape, addLocaleData, IntlProvider} from 'react-intl'
import cs from 'react-intl/locale-data/cs'
import de from 'react-intl/locale-data/de'
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import hu from 'react-intl/locale-data/hu'
import id from 'react-intl/locale-data/id'
import it from 'react-intl/locale-data/it'
import ja from 'react-intl/locale-data/ja'
import ko from 'react-intl/locale-data/ko'
import nl from 'react-intl/locale-data/nl'
import pt from 'react-intl/locale-data/pt'
import ru from 'react-intl/locale-data/ru'
import sk from 'react-intl/locale-data/sk'
import zh from 'react-intl/locale-data/zh'
import {AppRegistry, Text} from 'react-native'
import {Provider, useSelector} from 'react-redux'

import {handleGeneralError, setupHooks} from './actions'
import App from './App'
import {name as appName} from './app.json'
import {CONFIG} from './config/config'
import getConfiguredStore from './helpers/configureStore'
import translations from './i18n/translations'
import {languageSelector} from './selectors'
import {setLogLevel} from './utils/logging'

setLogLevel(CONFIG.LOG_LEVEL)

bluebird.config({
  longStackTraces: true,
  warnings: true,
})

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([...en, ...ja, ...ko, ...ru, ...es, ...zh, ...id, ...pt, ...de, ...fr, ...it, ...nl, ...cs, ...hu, ...sk])

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
