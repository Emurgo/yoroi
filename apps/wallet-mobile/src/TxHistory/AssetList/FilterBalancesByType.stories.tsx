import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {FilterBalancesByType} from './FilterBalancesByType'

storiesOf('TxHistory Filter Balances By Type', module).add('all (initial)', () => (
  <FilterBalancesByType<'all' | 'assets' | 'tokens'>
    chips={[
      {
        label: 'All',
        value: 'all',
        onPress: () => {
          action('all')
        },
      } as const,
      {
        label: 'Assets',
        value: 'assets',
        onPress: () => {
          action('assets')
        },
      } as const,
      {
        label: 'Tokens',
        value: 'tokens',
        onPress: () => {
          action('tokens')
        },
      } as const,
    ]}
    selectedValue="all"
  />
))
