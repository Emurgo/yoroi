// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import SaveReadOnlyWalletScreen from './SaveReadOnlyWalletScreen'
import {NavigationRouteContext} from '@react-navigation/native'

storiesOf('SaveReadOnlyWalletScreen', module).add('Default', () => {
  const route = {
    key: 'key',
    name: 'name',
    params: {
      publicKeyHex:
        '42cfdc53da2220ba52ce62f8e20ab9bb99857a3fceacf43d676d7987ad909b53ed75534e0d0ee8fce835eb2e7c67c5caec18a9c894388d9a046380edebbfc46d',
      path: [2147485500, 2147485463, 2147483648],
    },
  }

  return (
    <NavigationRouteContext.Provider value={route}>
      <SaveReadOnlyWalletScreen />
    </NavigationRouteContext.Provider>
  )
})
