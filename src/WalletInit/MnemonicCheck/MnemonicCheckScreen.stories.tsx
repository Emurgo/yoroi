import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {CONFIG} from '../../legacy/config'
import {MnemonicCheckScreen} from './MnemonicCheckScreen'

storiesOf('MnemonicCheckScreen', module)
  .add('Default', () => {
    const route = {
      key: 'key',
      name: 'name',
      params: {
        mnemonic: CONFIG.DEBUG.MNEMONIC1,
        name: CONFIG.DEBUG.WALLET_NAME,
        password: CONFIG.DEBUG.PASSWORD,
        networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
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
