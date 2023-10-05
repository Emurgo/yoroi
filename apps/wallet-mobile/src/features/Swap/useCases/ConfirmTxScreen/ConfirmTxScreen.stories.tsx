import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {mocks} from '../../common/mocks'
import {SwapFormProvider} from '../../common/SwapFormProvider'
import {ConfirmTxScreen} from './ConfirmTxScreen'

storiesOf('Swap ConfirmTxScreen', module) //
  .add('swap confirm tx: with password', () => {
    return <ConfirmTxWithPasswaordScreen />
  })
  .add('swap confirm tx: with os', () => {
    return <ConfirmTxWithOSScreen />
  })
  .add('swap confirm tx: with hw', () => {
    return <ConfirmTxWithHWcreen />
  })

const ConfirmTxWithPasswaordScreen = () => {
  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
      <SwapProvider
        initialState={{
          ...mockSwapStateDefault,
          unsignedTx: walletMocks.yoroiUnsignedTx,
          orderData: {...mocks.confirmTx.orderData},
        }}
        swapManager={{
          ...mockSwapManager,
        }}
      >
        <SwapFormProvider>
          <ConfirmTxScreen />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
const ConfirmTxWithOSScreen = () => {
  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet, isEasyConfirmationEnabled: true}}>
      <SwapProvider
        initialState={{
          ...mockSwapStateDefault,
          unsignedTx: walletMocks.yoroiUnsignedTx,
          orderData: {...mocks.confirmTx.orderData},
        }}
        swapManager={{
          ...mockSwapManager,
        }}
      >
        <SwapFormProvider>
          <ConfirmTxScreen />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
const ConfirmTxWithHWcreen = () => {
  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet, isHW: true}}>
      <SwapProvider
        initialState={{
          ...mockSwapStateDefault,
          unsignedTx: walletMocks.yoroiUnsignedTx,
          orderData: {...mocks.confirmTx.orderData},
        }}
        swapManager={{
          ...mockSwapManager,
        }}
      >
        <SwapFormProvider>
          <ConfirmTxScreen />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
