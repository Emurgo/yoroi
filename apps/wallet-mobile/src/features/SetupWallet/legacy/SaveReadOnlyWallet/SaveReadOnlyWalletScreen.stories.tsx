import {NavigationRouteContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {Api} from '@yoroi/types'
import React from 'react'

import {rootStorage} from '../../../../kernel/storage/rootStorage'
import {buildPortfolioTokenManagers} from '../../../Portfolio/common/helpers/build-token-managers'
import {WalletManagerProvider} from '../../../WalletManager/context/WalletManagerProvider'
import {buildNetworkManagers} from '../../../WalletManager/network-manager/network-manager'
import {WalletManager} from '../../../WalletManager/wallet-manager'
import {SaveReadOnlyWalletScreen} from './SaveReadOnlyWalletScreen'

// TODO: should be mocked
const {tokenManagers} = buildPortfolioTokenManagers()
const networkManagers = buildNetworkManagers({tokenManagers})
const walletManager = new WalletManager({
  rootStorage,
  networkManagers,
})

storiesOf('SaveReadOnlyWalletScreen', module)
  .add('Default', () => {
    const route = {
      key: 'key',
      name: 'name',
      params: {
        publicKeyHex:
          '42cfdc53da2220ba52ce62f8e20ab9bb99857a3fceacf43d676d7987ad909b53ed75534e0d0ee8fce835eb2e7c67c5caec18a9c894388d9a046380edebbfc46d',
        path: [2147485500, 2147485463, 2147483648],
        networkId: 1,
        walletImplmentationId: 'haskell-shelley',
      },
    }

    return (
      <NavigationRouteContext.Provider value={route}>
        <SaveReadOnlyWalletScreen />
      </NavigationRouteContext.Provider>
    )
  })
  .add('error, no network connection', () => {
    const route = {
      key: 'key',
      name: 'name',
      params: {
        publicKeyHex:
          '42cfdc53da2220ba52ce62f8e20ab9bb99857a3fceacf43d676d7987ad909b53ed75534e0d0ee8fce835eb2e7c67c5caec18a9c894388d9a046380edebbfc46d',
        path: [2147485500, 2147485463, 2147483648],
        networkId: 1,
        walletImplmentationId: 'haskell-shelley',
      },
    }

    return (
      <NavigationRouteContext.Provider value={route}>
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
          <SaveReadOnlyWalletScreen />
        </WalletManagerProvider>
      </NavigationRouteContext.Provider>
    )
  })
