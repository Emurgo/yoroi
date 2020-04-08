// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import ConnectNanoXScreen from './ConnectNanoXScreen'

const devices = [
  {name: 'NANO X 08E4', id: 1},
  {name: 'NANO X 1DF2', id: 2},
  {name: 'NANO X 0A41', id: 3},
  {name: 'NANO X 2D79', id: 4},
  {name: 'NANO X 9F42', id: 5},
]

storiesOf('ConnectNanoXScreen', module)
  .add('default', ({navigation}) => (
    <ConnectNanoXScreen navigation={navigation} />
  ))
  .add('with one device', ({navigation}) => (
    <ConnectNanoXScreen navigation={navigation} defaultDevices={[devices[0]]} />
  ))
  .add('with two devices', ({navigation}) => (
    <ConnectNanoXScreen
      navigation={navigation}
      defaultDevices={[devices[0], devices[1]]}
    />
  ))
  .add('with many devices', ({navigation}) => (
    <ConnectNanoXScreen navigation={navigation} defaultDevices={devices} />
  ))
