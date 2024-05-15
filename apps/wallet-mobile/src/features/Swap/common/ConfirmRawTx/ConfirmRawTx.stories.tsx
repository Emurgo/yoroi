import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../WalletManager/context/SelectedWalletContext'
import {mocks} from '../mocks'
import {SwapFormProvider} from '../SwapFormProvider'
import {ConfirmRawTx} from './ConfirmRawTx'

const bech32Address = 'addr1vpu5vlrf4xkxv2qpwngf6cjhtw542ayty80v8dyr49rf5eg0yu80w'
const utxo = 'utxo'
const cancelOrder = () => Promise.resolve('cbor')

storiesOf('ConfirmRawTx', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('ConfirmRawTxWithPassword', () => (
    <Provider wallet={walletMocks.wallet}>
      <ConfirmRawTx utxo={utxo} bech32Address={bech32Address} cancelOrder={cancelOrder} />
    </Provider>
  ))
  .add('ConfirmRawTxWithOs', () => (
    <Provider wallet={{...walletMocks.wallet, isEasyConfirmationEnabled: true}}>
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
    <SelectedWalletProvider wallet={wallet}>
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
    </SelectedWalletProvider>
  )
}
