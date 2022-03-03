import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../../storybook'
import {Modal} from '../../components'
import {LedgerConnect} from './LedgerConnect'

const devices = [
  {name: 'NANO X 08E4', id: 1},
  {name: 'NANO X 1DF2', id: 2},
  {name: 'NANO X 0A41', id: 3},
  {name: 'NANO X 2D79', id: 4},
  {name: 'NANO X 9F42', id: 5},
]

storiesOf('Ledger connect', module)
  .add('Using BLE', () => (
    <WithModalProps>
      {({onPress, ...props}) => (
        <Modal {...props} showCloseIcon>
          <LedgerConnect
            onConnectBLE={onPress('onConnectBLE')}
            onConnectUSB={onPress('onConnectUSB')}
            useUSB={false}
            onWaitingMessage={''}
            defaultDevices={devices}
          />
        </Modal>
      )}
    </WithModalProps>
  ))
  .add('Using USB', () => (
    <WithModalProps>
      {({onPress, ...props}) => (
        <Modal {...props} showCloseIcon>
          <LedgerConnect
            onConnectBLE={onPress('onConnectBLE')}
            onConnectUSB={onPress('onConnectUSB')}
            useUSB
            onWaitingMessage={''}
            defaultDevices={devices}
          />
        </Modal>
      )}
    </WithModalProps>
  ))
  .add('BLE with many devices', () => (
    <WithModalProps>
      {({onPress, ...props}) => (
        <Modal {...props} showCloseIcon>
          <LedgerConnect
            onConnectBLE={onPress('onConnectBLE')}
            onConnectUSB={onPress('onConnectUSB')}
            useUSB={false}
            onWaitingMessage={''}
            defaultDevices={devices}
          />
        </Modal>
      )}
    </WithModalProps>
  ))
