// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'

// $FlowExpectedError
import {withModalProps} from '../../../storybook'
import {Modal} from '../UiKit'
import LedgerConnect from './LedgerConnect'

const devices = [
  {name: 'NANO X 08E4', id: 1},
  {name: 'NANO X 1DF2', id: 2},
  {name: 'NANO X 0A41', id: 3},
  {name: 'NANO X 2D79', id: 4},
  {name: 'NANO X 9F42', id: 5},
]

storiesOf('Ledger connect', module)
  .addDecorator(withModalProps)
  .add('Using BLE', ({visible, onRequestClose, onPress}) => (
    <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
      <LedgerConnect
        onConnectBLE={onPress('onConnectBLE')}
        onConnectUSB={onPress('onConnectUSB')}
        useUSB={false}
        onWaitingMessage={''}
        defaultDevices={devices}
      />
    </Modal>
  ))
  .add('Using USB', ({visible, onRequestClose, onPress}) => (
    <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
      <LedgerConnect
        onConnectBLE={onPress('onConnectBLE')}
        onConnectUSB={onPress('onConnectUSB')}
        useUSB
        onWaitingMessage={''}
        defaultDevices={devices}
      />
    </Modal>
  ))
  .add('BLE with many devices', ({visible, onRequestClose, onPress}) => (
    <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
      <LedgerConnect
        onConnectBLE={onPress('onConnectBLE')}
        onConnectUSB={onPress('onConnectUSB')}
        useUSB={false}
        onWaitingMessage={''}
        defaultDevices={devices}
      />
    </Modal>
  ))
