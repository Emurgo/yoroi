import * as React from 'react'
import {createIntl, createIntlCache, IntlProvider} from 'react-intl'
import type {IntlShape} from 'react-intl'
import {Text} from 'react-native'

import translations from '../../legacy/i18n/translations'

const cache = createIntlCache()
const intl = createIntl({locale: 'en-US', messages: translations['en-US']}, cache)

type StoryFn = ({intl: IntlShape}) => React.ReactNode

export const withIntlProp = (storyFn: StoryFn) => (
  <IntlProvider locale={'en-US'} messages={translations['en-US']} textComponent={Text}>
    {storyFn({intl})}
  </IntlProvider>
)
