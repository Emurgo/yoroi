import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../SelectedWallet'
import {mocks} from '../../yoroi-wallets/mocks'
import {SendProvider} from '../Context/SendContext'
import {AssetSelectorScreen} from './AssetSelectorScreen'

storiesOf('AssetSelectorScreen', module).add('Default', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider wallet={mocks.wallet}>
        <AssetSelectorScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
})
