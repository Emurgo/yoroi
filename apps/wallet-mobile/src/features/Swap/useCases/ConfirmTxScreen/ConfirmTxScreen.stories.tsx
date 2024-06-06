import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, orderMocks, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {rootStorage} from '../../../../kernel/storage/rootStorage'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {buildPortfolioTokenManagers} from '../../../Portfolio/common/helpers/build-token-managers'
import {SelectedWalletProvider} from '../../../WalletManager/context/SelectedWalletContext'
import {WalletManagerProvider} from '../../../WalletManager/context/WalletManagerProvider'
import {buildNetworkManagers} from '../../../WalletManager/network-manager/network-manager'
import {WalletManager} from '../../../WalletManager/wallet-manager'
import {mocks} from '../../common/mocks'
import {SwapFormProvider} from '../../common/SwapFormProvider'
import {ConfirmTxScreen} from './ConfirmTxScreen'

// TODO: should be mocked
const {tokenManagers} = buildPortfolioTokenManagers()
const networkManagers = buildNetworkManagers({tokenManagers})
const walletManager = new WalletManager({
  rootStorage,
  networkManagers,
})

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
    <WalletManagerProvider walletManager={walletManager}>
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
    </WalletManagerProvider>
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
