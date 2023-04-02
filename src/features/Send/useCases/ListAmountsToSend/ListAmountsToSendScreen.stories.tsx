import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks} from '../../../../yoroi-wallets/mocks/wallet'
import {SendProvider} from '../../common/SendContext'
import {ListAmountsToSendScreen} from './ListAmountsToSendScreen'

storiesOf('List Amounts To Send', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider initialState={{}}>
        <ListAmountsToSendScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
})
