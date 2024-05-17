import {NavigationRouteContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {Api} from '@yoroi/types'
import React from 'react'

import {WalletManager, walletManager} from '../../../WalletManager/common/walletManager'
import {WalletManagerProvider} from '../../../WalletManager/context/WalletManagerContext'
import {SaveNanoXScreen} from './SaveNanoXScreen'

storiesOf('SaveNanoXScreen', module)
  .add('default', () => (
    <NavigationRouteContext.Provider
      value={{
        key: 'key',
        name: 'name',
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
      }}
    >
      <WalletManagerProvider
        walletManager={
          {
            ...walletManager,
            createWalletWithBip44Account: async (...args: unknown[]) => {
              action('createWalletWithBip44Account')(...args)
              await new Promise((resolve) => setTimeout(resolve, 1000))
              throw new Api.Errors.Network()
            },
          } as unknown as WalletManager
        }
      >
        <SaveNanoXScreen />
      </WalletManagerProvider>
    </NavigationRouteContext.Provider>
  ))
