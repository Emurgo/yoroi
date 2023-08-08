import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {SwapTokensView} from './SwapTokensView'

storiesOf('Swap Tokens View', module) //
  .add('adding: initial state', () => {
    return <Adding />
  })

const Adding = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <SwapTokensView />
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
