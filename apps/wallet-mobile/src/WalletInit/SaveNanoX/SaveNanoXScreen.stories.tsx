import {NavigationRouteContext, RouteProp} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WalletInitRoutes} from '../../navigation'
import {WalletManagerProvider} from '../../WalletManager'
import {NETWORK_ID, WALLET_IMPLEMENTATION_ID} from '../../yoroi-wallets/cardano/constants/testnet/constants'
import {NetworkError} from '../../yoroi-wallets/cardano/errors'
import {WalletManager, walletManager} from '../../yoroi-wallets/walletManager'
import {SaveNanoXScreen} from './SaveNanoXScreen'

const params: RouteProp<WalletInitRoutes, 'save-nano-x'>['params'] = {
  networkId: NETWORK_ID,
  walletImplementationId: WALLET_IMPLEMENTATION_ID,
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

storiesOf('SaveNanoXScreen', module)
  .add('default', () => (
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
  .add('error, no network connection', () => (
    <NavigationRouteContext.Provider
      value={{
        key: 'key',
        name: 'name',
        params,
      }}
    >
      <WalletManagerProvider
        walletManager={
          {
            ...walletManager,
            createWalletWithBip44Account: async (...args: unknown[]) => {
              action('createWalletWithBip44Account')(...args)
              await new Promise((resolve) => setTimeout(resolve, 1000))
              throw new NetworkError()
            },
          } as unknown as WalletManager
        }
      >
        <SaveNanoXScreen />
      </WalletManagerProvider>
    </NavigationRouteContext.Provider>
  ))
