// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import ImportReadOnlyWalletScreen from './ImportReadOnlyWalletScreen'
import {NavigationRouteContext} from '@react-navigation/native'

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
