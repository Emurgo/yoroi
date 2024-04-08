import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, orderMocks, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../SelectedWallet/Context'
import {mocks} from '../../common/mocks'
import {SwapFormProvider} from '../../common/SwapFormProvider'
import {ConfirmTxScreen} from './ConfirmTxScreen'

storiesOf('Swap ConfirmTxScreen', module) //
  .add('swap confirm tx: with password', () => {
    return <ConfirmTxWithPasswordScreen />
  })
  .add('swap confirm tx: with os', () => {
    return <ConfirmTxWithOSScreen />
  })
  .add('swap confirm tx: with hw', () => {
    return <ConfirmTxWithHWScreen />
  })

const ConfirmTxWithPasswordScreen = () => {
  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
      <SwapProvider
        initialState={{
          ...mockSwapStateDefault,
          unsignedTx: walletMocks.yoroiUnsignedTx,
          orderData: {
            ...mocks.confirmTx.orderData,
            selectedPoolCalculation: calculation,
          },
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
          orderData: {
            ...mocks.confirmTx.orderData,
            selectedPoolCalculation: calculation,
          },
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
const ConfirmTxWithHWScreen = () => {
  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet, isHW: true}}>
      <SwapProvider
        initialState={{
          ...mockSwapStateDefault,
          unsignedTx: walletMocks.yoroiUnsignedTx,
          orderData: {
            ...mocks.confirmTx.orderData,
            selectedPoolCalculation: calculation,
          },
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

const calculation = orderMocks.mockedOrderCalculations1[0]
