import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {CreateOrder} from './CreateOrder'

storiesOf('Swap Create Order', module) //
  .add('initial state', () => {
    return <Initial />
  })

const Initial = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <CreateOrder />
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
