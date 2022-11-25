import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
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
