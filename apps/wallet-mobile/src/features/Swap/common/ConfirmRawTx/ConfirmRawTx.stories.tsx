import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {rootStorage} from '../../../../kernel/storage/rootStorage'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {buildPortfolioTokenManagers} from '../../../Portfolio/common/helpers/build-token-managers'
import {WalletManagerProvider} from '../../../WalletManager/context/WalletManagerProvider'
import {buildNetworkManagers} from '../../../WalletManager/network-manager/network-manager'
import {WalletManager} from '../../../WalletManager/wallet-manager'
import {mocks} from '../mocks'
import {SwapFormProvider} from '../SwapFormProvider'
import {ConfirmRawTx} from './ConfirmRawTx'

const bech32Address = 'addr1vpu5vlrf4xkxv2qpwngf6cjhtw542ayty80v8dyr49rf5eg0yu80w'
const utxo = 'utxo'
const cancelOrder = () => Promise.resolve('cbor')

// TODO: should be mocked
const {tokenManagers} = buildPortfolioTokenManagers()
const networkManagers = buildNetworkManagers({tokenManagers})
const walletManager = new WalletManager({
  rootStorage,
  networkManagers,
})

storiesOf('ConfirmRawTx', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('ConfirmRawTxWithPassword', () => (
    <Provider wallet={walletMocks.wallet}>
      <ConfirmRawTx utxo={utxo} bech32Address={bech32Address} cancelOrder={cancelOrder} />
    </Provider>
  ))
  .add('ConfirmRawTxWithOs', () => (
    <Provider wallet={{...walletMocks.wallet}}>
      <ConfirmRawTx utxo={utxo} bech32Address={bech32Address} cancelOrder={cancelOrder} />
    </Provider>
  ))
  .add('ConfirmRawTxWithHw', () => (
    <Provider wallet={{...walletMocks.wallet, isHW: true}}>
      <ConfirmRawTx utxo={utxo} bech32Address={bech32Address} cancelOrder={cancelOrder} />
    </Provider>
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

const Provider = ({children, wallet}: {children: React.ReactNode; wallet: YoroiWallet}) => {
  return (
    <WalletManagerProvider walletManager={walletManager}>
      <WalletManagerProviderMock wallet={wallet}>
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
          <SwapFormProvider>{children}</SwapFormProvider>
        </SwapProvider>
      </WalletManagerProviderMock>
    </WalletManagerProvider>
  )
}
