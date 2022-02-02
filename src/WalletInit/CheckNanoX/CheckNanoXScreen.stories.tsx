import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../../legacy/config/config'
import {CheckNanoXScreen, Params} from './CheckNanoXScreen'

storiesOf('CheckNanoXScreen', module)
  .add('ble', () => {
    const params: Params = {
      networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
      walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
    }

    return (
      <NavigationRouteContext.Provider value={{key: 'key', name: 'name', params}}>
        <CheckNanoXScreen />
      </NavigationRouteContext.Provider>
    )
  })
  .add('usb', () => {
    const params: Params = {
      useUSB: true,
      networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
      walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
    }

    return (
      <NavigationRouteContext.Provider value={{key: 'key', name: 'name', params}}>
        <CheckNanoXScreen />
      </NavigationRouteContext.Provider>
    )
  })
