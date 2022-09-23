import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {SendProvider} from '../Context/SendContext'
import {AssetSelectorScreen} from './AssetSelectorScreen'

storiesOf('AssetSelectorScreen', module).add('Default', () => {
  return (
    <SelectedWalletProvider
      wallet={{
        ...mockWallet,
        subscribe: (...args) => {
          action('subscribe')(...args)
          return action('unsubscribe')
        },
      }}
    >
      <SendProvider wallet={mockWallet}>
        <AssetSelectorScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
})
