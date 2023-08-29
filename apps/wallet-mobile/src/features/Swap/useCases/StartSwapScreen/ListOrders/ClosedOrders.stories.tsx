import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {ClosedOrders} from './ClosedOrders'

storiesOf('Swap Closed Orders', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <ClosedOrders />
    </SelectedWalletProvider>
  )
})
