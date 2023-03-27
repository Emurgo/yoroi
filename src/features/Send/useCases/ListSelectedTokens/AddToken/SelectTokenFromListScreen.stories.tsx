import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SendProvider} from '../../../common/SendContext'
import {SelectTokenFromListScreen} from './SelectTokenFromListScreen'

storiesOf('Send/SelectTokenFromList', module).add('Default', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider>
        <SelectTokenFromListScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
})
