import {NavigationRouteContext} from '@react-navigation/native'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {networkConfigs} from '../../../WalletManager/network-manager/network-manager'
import {ConnectNanoXScreen} from './ConnectNanoXScreen'

const devices = [
  {name: 'NANO X 08E4', id: 1},
  {name: 'NANO X 1DF2', id: 2},
  {name: 'NANO X 0A41', id: 3},
  {name: 'NANO X 2D79', id: 4},
  {name: 'NANO X 9F42', id: 5},
]

const bleRoute = {
  key: 'key',
  name: 'name',
  params: {
    useUSB: false,
    networkId: networkConfigs['mainnet'].chainId,
    walletImplementationId: 'cardano-bip44',
  },
}

const usbRoute = {
  key: 'key',
  name: 'name',
  params: {
    useUSB: true,
    networkId: networkConfigs['mainnet'].chainId,
    walletImplementationId: 'cardano-bip44',
  },
}

storiesOf('ConnectNanoXScreen', module)
  .add('BLE - with one device', () => (
    <NavigationRouteContext.Provider value={bleRoute}>
      <ConnectNanoXScreen defaultDevices={[devices[0]]} />
    </NavigationRouteContext.Provider>
  ))
  .add('BLE - with many devices', () => (
    <NavigationRouteContext.Provider value={bleRoute}>
      <ConnectNanoXScreen defaultDevices={devices} />
    </NavigationRouteContext.Provider>
  ))
  .add('USB - with one device', () => (
    <NavigationRouteContext.Provider value={usbRoute}>
      <ConnectNanoXScreen defaultDevices={[devices[0]]} />
    </NavigationRouteContext.Provider>
  ))
  .add('USB - with many devices', () => (
    <NavigationRouteContext.Provider value={usbRoute}>
      <ConnectNanoXScreen defaultDevices={devices} />
    </NavigationRouteContext.Provider>
  ))
