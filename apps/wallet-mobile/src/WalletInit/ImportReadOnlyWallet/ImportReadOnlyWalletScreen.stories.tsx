import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ImportReadOnlyWalletScreen} from './ImportReadOnlyWalletScreen'

storiesOf('ImportReadOnlyWalletScreen', module).add('Default', () => (
  <NavigationRouteContext.Provider
    value={{
      key: 'key',
      name: 'name',
      params: {
        walletImplementationId: 'walletImplementationId',
        networkId: 'networkId',
      },
    }}
  >
    <ImportReadOnlyWalletScreen />
  </NavigationRouteContext.Provider>
))
