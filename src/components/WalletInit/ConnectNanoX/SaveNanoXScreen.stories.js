// @flow

import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../../config/config'
import SaveNanoXScreen, {type Params} from './SaveNanoXScreen'

const params: Params = {
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
