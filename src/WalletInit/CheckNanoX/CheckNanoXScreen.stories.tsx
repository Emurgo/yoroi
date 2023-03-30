import {NavigationRouteContext, RouteProp} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WalletInitRoutes} from '../../navigation'
import {NETWORK_ID, WALLET_IMPLEMENTATION_ID} from '../../yoroi-wallets/cardano/constants/testnet/constants'
import {CheckNanoXScreen} from './CheckNanoXScreen'

storiesOf('CheckNanoXScreen', module)
  .add('ble', () => {
    const params: RouteProp<WalletInitRoutes, 'connect-nano-x'>['params'] = {
      useUSB: false,
      networkId: NETWORK_ID,
      walletImplementationId: WALLET_IMPLEMENTATION_ID,
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
      networkId: NETWORK_ID,
      walletImplementationId: WALLET_IMPLEMENTATION_ID,
    }

    return (
      <NavigationRouteContext.Provider value={{key: 'key', name: 'name', params}}>
        <CheckNanoXScreen />
      </NavigationRouteContext.Provider>
    )
  })
