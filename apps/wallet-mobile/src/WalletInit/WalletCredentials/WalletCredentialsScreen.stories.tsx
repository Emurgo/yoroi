import {NavigationRouteContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WalletManager, walletManager} from '../../wallet-manager/walletManager'
import {WalletManagerProvider} from '../../wallet-manager/WalletManagerContext'
import {NetworkError} from '../../yoroi-wallets/cardano/errors'
import {WalletCredentialsScreen} from './WalletCredentialsScreen'

storiesOf('WalletCredentialsScreen', module)
  .add('Default', () => {
    const route = {
      key: 'key',
      name: 'name',
      params: {
        phrase: 'phrase',
        networkId: 300,
        walletImplementationId: 'haskell',
        provider: 'provider',
      },
    }

    return (
      <NavigationRouteContext.Provider value={route}>
        <WalletManagerProvider
          walletManager={
            {
              ...walletManager,
              createWallet: (...args: unknown[]) => {
                action('create wallet')(...args)
              },
            } as unknown as WalletManager
          }
        >
          <WalletCredentialsScreen />
        </WalletManagerProvider>
      </NavigationRouteContext.Provider>
    )
  })
  .add('error, no network connection', () => {
    const route = {
      key: 'key',
      name: 'name',
      params: {
        phrase: 'phrase',
        networkId: 300,
        walletImplementationId: 'haskell',
        provider: 'provider',
      },
    }

    return (
      <NavigationRouteContext.Provider value={route}>
        <WalletManagerProvider
          walletManager={
            {
              ...walletManager,
              createWallet: (...args: unknown[]) => {
                action('create wallet')(...args)
                throw new NetworkError()
              },
            } as unknown as WalletManager
          }
        >
          <WalletCredentialsScreen />
        </WalletManagerProvider>
      </NavigationRouteContext.Provider>
    )
  })
