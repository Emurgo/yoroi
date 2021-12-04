import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SaveReadOnlyWalletScreen} from './SaveReadOnlyWalletScreen'

storiesOf('SaveReadOnlyWalletScreen', module).add('Default', () => {
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
