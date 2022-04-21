import {NavigationRouteContext, RouteProp} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../legacy/config'
import {WalletInitRoutes} from '../../navigation'
import {CheckNanoXScreen} from './CheckNanoXScreen'

storiesOf('CheckNanoXScreen', module)
  .add('ble', () => {
    const params: RouteProp<WalletInitRoutes, 'connect-nano-x'>['params'] = {
      useUSB: false,
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
    const params: RouteProp<WalletInitRoutes, 'connect-nano-x'>['params'] = {
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
