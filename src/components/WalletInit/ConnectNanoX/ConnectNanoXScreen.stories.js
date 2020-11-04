// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import ConnectNanoXScreen from './ConnectNanoXScreen'
import {CONFIG} from '../../../config/config'

const devices = [
  {name: 'NANO X 08E4', id: 1},
  {name: 'NANO X 1DF2', id: 2},
  {name: 'NANO X 0A41', id: 3},
  {name: 'NANO X 2D79', id: 4},
  {name: 'NANO X 9F42', id: 5},
]

const route = {
  params: {
    useUSB: false,
    networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
    walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
  },
}

storiesOf('ConnectNanoXScreen', module)
  .add('default', ({navigation}) => (
    <ConnectNanoXScreen navigation={navigation} route={route} />
  ))
  .add('with one device', ({navigation}) => (
    <ConnectNanoXScreen navigation={navigation} route={route} defaultDevices={[devices[0]]} />
  ))
  .add('with two devices', ({navigation}) => (
    <ConnectNanoXScreen
      navigation={navigation}
      defaultDevices={[devices[0], devices[1]]}
      route={route}
    />
  ))
  .add('with many devices', ({navigation}) => (
    <ConnectNanoXScreen navigation={navigation} route={route} defaultDevices={devices} />
  ))
