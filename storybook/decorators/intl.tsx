import React from 'react'
import {createIntl, createIntlCache, IntlProvider} from 'react-intl'
import {Text} from 'react-native'

import translations from '../../legacy/i18n/translations'

const cache = createIntlCache()
const intl = createIntl({locale: 'en-US', messages: translations['en-US']}, cache)

export const withIntl = (storyFn) => (
  <IntlProvider locale={'en-US'} messages={translations['en-US']} textComponent={Text}>
    {storyFn()}
  </IntlProvider>
)
