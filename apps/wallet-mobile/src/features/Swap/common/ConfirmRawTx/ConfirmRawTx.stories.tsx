import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {rootStorage} from '../../../../kernel/storage/rootStorage'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {buildPortfolioTokenManagers} from '../../../Portfolio/common/helpers/build-token-managers'
import {WalletManagerProvider} from '../../../WalletManager/context/WalletManagerProvider'
import {buildNetworkManagers} from '../../../WalletManager/network-manager/network-manager'
import {WalletManager} from '../../../WalletManager/wallet-manager'
import {mocks} from '../mocks'
import {SwapFormProvider} from '../SwapFormProvider'
import {ConfirmRawTx} from './ConfirmRawTx'

const cbor =
  '84a600818258204254295cd9436a3b1aa83a575b052c71e2120ea309894fdc1be35e56098e702400018182583901b0d64f1fedab1275e9d3d6ef4881e1a53bbc64ba2f80c508daf2ab400b6d27379cecac96bfb81014c98f91554da4c9c9a690ebf22bcfd3f41a00394131021a0003c7e70b5820bdb24bcc1d474e070f3f00ca3e8c3bc31094478a9399983b746b8585737b18de0d818258200e9f475ee7581fa398259b0f3590bab663daccbd3c671020ec9e82fd136c9e1f000e81581cb0d64f1fedab1275e9d3d6ef4881e1a53bbc64ba2f80c508daf2ab40a3038159014f59014c01000032323232323232322223232325333009300e30070021323233533300b3370e9000180480109118011bae30100031225001232533300d3300e22533301300114a02a66601e66ebcc04800400c5288980118070009bac3010300c300c300c300c300c300c300c007149858dd48008b18060009baa300c300b3754601860166ea80184ccccc0288894ccc04000440084c8c94ccc038cd4ccc038c04cc030008488c008dd718098018912800919b8f0014891ce1317b152faac13426e6a83e06ff88a4d62cce3c1634ab0a5ec133090014a0266008444a00226600a446004602600a601a00626600a008601a006601e0026ea8c03cc038dd5180798071baa300f300b300e3754601e00244a0026eb0c03000c92616300a001375400660106ea8c024c020dd5000aab9d5744ae688c8c0088cc0080080048c0088cc00800800555cf2ba15573e6e1d200201049fd8799fd8799fd8799f581cb0d64f1fedab1275e9d3d6ef4881e1a53bbc64ba2f80c508daf2ab40ffd8799fd8799fd8799f581c0b6d27379cecac96bfb81014c98f91554da4c9c9a690ebf22bcfd3f4ffffffffd8799fd8799f581cb0d64f1fedab1275e9d3d6ef4881e1a53bbc64ba2f80c508daf2ab40ffd8799fd8799fd8799f581c0b6d27379cecac96bfb81014c98f91554da4c9c9a690ebf22bcfd3f4ffffffffd87a80d8799fd8799f581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a4443415354ff1a0001d010ff1a001e84801a001e8480ffff0581840000d87a80821a0005cc601a08f0d180f5f6'

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
      <ConfirmRawTx cbor={cbor} />
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
