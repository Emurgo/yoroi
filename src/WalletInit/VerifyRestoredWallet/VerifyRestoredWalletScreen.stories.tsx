import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../legacy/config'
import {NETWORK_ID, WALLET_IMPLEMENTATION_ID} from '../../yoroi-wallets/cardano/shelley-testnet/constants'
import {cleanMnemonic} from '../../yoroi-wallets/utils/validators'
import {VerifyRestoredWalletScreen} from './VerifyRestoredWalletScreen'

const route = {
  key: 'key',
  name: 'name',
  params: {
    networkId: NETWORK_ID,
    walletImplementationId: WALLET_IMPLEMENTATION_ID,
    phrase: cleanMnemonic(CONFIG.DEBUG.MNEMONIC3),
  },
}

storiesOf('VerifyRestoredWallet', module).add('Default', () => (
  <NavigationRouteContext.Provider value={route}>
    <VerifyRestoredWalletScreen />
  </NavigationRouteContext.Provider>
))
