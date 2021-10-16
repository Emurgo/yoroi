// @flow

import React, {type Node} from 'react'
import {type IntlShape, createIntl, createIntlCache, IntlProvider} from 'react-intl'
import {Text} from 'react-native'

import translations from '../../legacy/i18n/translations'

const cache = createIntlCache()
const intl = createIntl({locale: 'en-US', messages: translations['en-US']}, cache)

type StoryFn = ({intl: IntlShape}) => Node

export const withIntlProp = (storyFn: StoryFn) => (
  <IntlProvider locale={'en-US'} messages={translations['en-US']} textComponent={Text}>
    {storyFn({intl})}
  </IntlProvider>
)
