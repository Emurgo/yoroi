import {NavigationRouteContext, RouteProp} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import {CONFIG} from '@yoroi-wallets'
import React from 'react'

import {WalletInitRoutes} from '../../navigation'
import {SaveNanoXScreen} from './SaveNanoXScreen'

const params: RouteProp<WalletInitRoutes, 'save-nano-x'>['params'] = {
  networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
  walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
  hwDeviceInfo: {
    bip44AccountPublic: '0x1',
    hwFeatures: {
      deviceId: '0x1',
      deviceObj: undefined,
      model: ' model',
      vendor: 'vendor',
    },
  },
}

storiesOf('SaveNanoXScreen', module).add('default', () => (
  <NavigationRouteContext.Provider
    value={{
      key: 'key',
      name: 'name',
      params,
    }}
  >
    <SaveNanoXScreen />
  </NavigationRouteContext.Provider>
))
