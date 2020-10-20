// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import StorybookModalWrapper from '../Common/StorybookModalWrapper'
import LedgerConnect from './LedgerConnect'
import {Modal} from '../UiKit'

const devices = [
  {name: 'NANO X 08E4', id: 1},
  {name: 'NANO X 1DF2', id: 2},
  {name: 'NANO X 0A41', id: 3},
  {name: 'NANO X 2D79', id: 4},
  {name: 'NANO X 9F42', id: 5},
]

const LedgerConnectModal = ({
  visible,
  onRequestClose,
  navigation,
  defaultDevices,
  useUSB,
}) => (
  <Modal visible={visible} onRequestClose={onRequestClose}>
    <LedgerConnect
      navigation={navigation}
      onConnectBLE={() => ({})}
      onConnectUSB={() => ({})}
      onComplete={() => ({})}
      useUSB={useUSB}
      onWaitingMessage={''}
      defaultDevices={defaultDevices}
    />
  </Modal>
)

const StatefulModal = StorybookModalWrapper(LedgerConnectModal)

storiesOf('Ledger connect', module)
  .add('Using BLE', ({navigation}) => (
    <StatefulModal navigation={navigation} useUSB={false} />
  ))
  .add('Using USB', ({navigation}) => (
    <StatefulModal navigation={navigation} useUSB />
  ))
  .add('BLE with many devices', ({navigation}) => (
    <StatefulModal
      navigation={navigation}
      defaultDevices={devices}
      useUSB={false}
    />
  ))
