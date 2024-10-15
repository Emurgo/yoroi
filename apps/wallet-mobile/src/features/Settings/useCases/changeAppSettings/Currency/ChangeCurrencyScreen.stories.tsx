import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ChangeCurrencyScreen} from './ChangeCurrencyScreen'
import {CurrencyProvider} from './CurrencyContext'

storiesOf('ChangeCurrencyScreen', module).add('Default', () => (
  <CurrencyProvider>
    <ChangeCurrencyScreen />
  </CurrencyProvider>
))
