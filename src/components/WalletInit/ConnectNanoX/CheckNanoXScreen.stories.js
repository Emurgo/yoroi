// @flow

import {NavigationRouteContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../../config/config'
import CheckNanoXScreen from './CheckNanoXScreen'

storiesOf('CheckNanoXScreen', module)
  .add('ble', () => (
    <NavigationRouteContext.Provider
      value={{
        key: 'key',
        name: 'name',
        params: {
          networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
          walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
          hwDeviceInfo: {
            bip44AccountPublic: '0x1',
            hwFeatures: {
              deviceId: '0x1',
            },
          },
        },
      }}
    >
      <CheckNanoXScreen onPress={action('onPress')} />
    </NavigationRouteContext.Provider>
  ))
  .add('usb', () => (
    <NavigationRouteContext.Provider
      value={{
        key: 'key',
        name: 'name',
        params: {
          useUSB: true,
          networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
          walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
          hwDeviceInfo: {
            bip44AccountPublic: '0x1',
            hwFeatures: {
              deviceId: '0x1',
            },
          },
        },
      }}
    >
      <CheckNanoXScreen onPress={action('onPress')} />
    </NavigationRouteContext.Provider>
  ))
