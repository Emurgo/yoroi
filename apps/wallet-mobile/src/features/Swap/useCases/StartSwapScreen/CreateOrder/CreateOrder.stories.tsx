import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import {produce} from 'immer'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {CreateOrder} from './CreateOrder'

storiesOf('Swap Create Order', module) //
  .add('Initial', () => <Initial />)
  .add('Market Order', () => <MarketOrder />)
  .add('Limit Order', () => <LimitOrder />)

const Initial = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <CreateOrder />
      </SwapProvider>
    </SelectedWalletProvider>
  )
}

const MarketOrder = () => {
  const initialState = produce(mockSwapStateDefault, (draft) => {
    draft.createOrder.type = 'market'
  })
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
        <CreateOrder />
      </SwapProvider>
    </SelectedWalletProvider>
  )
}

const LimitOrder = () => {
  const initialState = produce(mockSwapStateDefault, (draft) => {
    draft.createOrder.type = 'limit'
  })
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
        <CreateOrder />
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
