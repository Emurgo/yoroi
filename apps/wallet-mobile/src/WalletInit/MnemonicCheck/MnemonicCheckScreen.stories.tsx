import {NavigationRouteContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {debugWalletInfo} from '../../features'
import {WalletManagerProvider} from '../../WalletManager'
import {NETWORK_ID} from '../../yoroi-wallets/cardano/constants/testnet/constants'
import {NetworkError} from '../../yoroi-wallets/cardano/errors'
import {WalletManager, walletManager} from '../../yoroi-wallets/walletManager'
import {MnemonicCheckScreen} from './MnemonicCheckScreen'

storiesOf('MnemonicCheckScreen', module)
  .add('Default', () => {
    const route = {
      key: 'key',
      name: 'name',
      params: {
        mnemonic: debugWalletInfo.MNEMONIC1,
        name: debugWalletInfo.WALLET_NAME,
        password: debugWalletInfo.PASSWORD,
        networkId: NETWORK_ID,
        walletImplementationId: 'haskell-shelley',
      },
    }

    return (
      <NavigationRouteContext.Provider value={route}>
        <MnemonicCheckScreen />
      </NavigationRouteContext.Provider>
    )
  })
  .add('with duplicates', () => {
    const mnemonicWithDuplicates = [
      'scrap scrap song',
      'radar lemon parade',
      'repeat parade media',
      'shrimp live benefit',
      'people room spider',
    ].join(' ')

    const route = {
      key: 'key',
      name: 'name',
      params: {
        mnemonic: mnemonicWithDuplicates,
        name: 'wallet name',
        password: 'password',
        networkId: 1,
        walletImplementationId: 'haskell-shelley',
      },
    }

    return (
      <NavigationRouteContext.Provider value={route}>
        <MnemonicCheckScreen />
      </NavigationRouteContext.Provider>
    )
  })
  .add('error, no network connection', () => {
    const mnemonicWithDuplicates = [
      'scrap scrap song',
      'radar lemon parade',
      'repeat parade media',
      'shrimp live benefit',
      'people room spider',
    ].join(' ')

    const route = {
      key: 'key',
      name: 'name',
      params: {
        mnemonic: mnemonicWithDuplicates,
        name: 'wallet name',
        password: 'password',
        networkId: 1,
        walletImplementationId: 'haskell-shelley',
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
          <MnemonicCheckScreen />
        </WalletManagerProvider>
      </NavigationRouteContext.Provider>
    )
  })
