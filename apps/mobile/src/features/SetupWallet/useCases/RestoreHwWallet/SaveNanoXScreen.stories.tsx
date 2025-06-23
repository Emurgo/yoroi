import {NavigationRouteContext} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {buildNetworkManagers} from '@yoroi/blockchains'
import {Api} from '@yoroi/types'
import React from 'react'

import {logger} from '../../../../kernel/logger/logger'
import {rootStorage} from '../../../../kernel/storage/rootStorage'
import {buildPortfolioTokenManagers} from '../../../Portfolio/common/helpers/build-token-managers'
import {WalletManagerProvider} from '../../../WalletManager/context/WalletManagerProvider'
import {WalletManager} from '../../../WalletManager/wallet-manager'
import {SaveNanoXScreen} from './SaveNanoXScreen'

// TODO: should be mocked
const {tokenManagers} = buildPortfolioTokenManagers()
const networkManagers = buildNetworkManagers({tokenManagers, logger})
const walletManager = new WalletManager({
  rootStorage,
  networkManagers,
})

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
