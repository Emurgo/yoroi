import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../legacy/config'
import {cleanMnemonic} from '../../yoroi-wallets/utils/validators'
import {VerifyRestoredWalletScreen} from './VerifyRestoredWalletScreen'

const route = {
  key: 'key',
  name: 'name',
  params: {
    networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
    walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
    phrase: cleanMnemonic(CONFIG.DEBUG.MNEMONIC3),
  },
}

storiesOf('VerifyRestoredWallet', module).add('Default', () => (
  <NavigationRouteContext.Provider value={route}>
    <VerifyRestoredWalletScreen />
  </NavigationRouteContext.Provider>
))
