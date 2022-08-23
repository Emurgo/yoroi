import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {balances, mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {SendProvider} from '../Context/SendContext'
import {AssetSelectorScreen} from './AssetSelectorScreen'

storiesOf('AssetSelectorScreen', module).add('Default', () => {
  return (
    <SelectedWalletProvider wallet={mockWallet}>
      <SendProvider wallet={mockWallet}>
        <AssetSelectorScreen balances={balances} />
      </SendProvider>
    </SelectedWalletProvider>
  )
})
