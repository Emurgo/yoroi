import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import {produce} from 'immer'
import React from 'react'

import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SwapFormProvider} from '../../../common/SwapFormProvider'
import {StartSwapOrderScreen} from './StartSwapOrderScreen'

storiesOf('Swap Start Order', module) //
  .add('Initial', () => <Initial />)
  .add('Market Order', () => <MarketOrder />)
  .add('Limit Order', () => <LimitOrder />)

const Initial = () => {
  return (
    <WalletManagerProviderMock wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <SwapFormProvider>
          <StartSwapOrderScreen />
        </SwapFormProvider>
      </SwapProvider>
    </WalletManagerProviderMock>
  )
}

const MarketOrder = () => {
  const initialState = produce(mockSwapStateDefault, (draft) => {
    draft.orderData.type = 'market'
  })
  return (
    <WalletManagerProviderMock wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
        <SwapFormProvider>
          <StartSwapOrderScreen />
        </SwapFormProvider>
      </SwapProvider>
    </WalletManagerProviderMock>
  )
}

const LimitOrder = () => {
  const initialState = produce(mockSwapStateDefault, (draft) => {
    draft.orderData.type = 'limit'
  })
  return (
    <WalletManagerProviderMock wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
        <SwapFormProvider>
          <StartSwapOrderScreen />
        </SwapFormProvider>
      </SwapProvider>
    </WalletManagerProviderMock>
  )
}
