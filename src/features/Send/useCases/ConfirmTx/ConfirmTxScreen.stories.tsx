import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {SendProvider} from '../../common/SendContext'
import {ConfirmTxScreen} from './ConfirmTxScreen'

storiesOf('Confirm Tx', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider initialState={{}}>
        <ConfirmTxScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
})
