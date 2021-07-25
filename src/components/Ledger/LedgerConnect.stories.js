// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import {withModalProps} from '../../../storybook/decorators'
import LedgerConnect from './LedgerConnect'
import {Modal} from '../UiKit'

const devices = [
  {name: 'NANO X 08E4', id: 1},
  {name: 'NANO X 1DF2', id: 2},
  {name: 'NANO X 0A41', id: 3},
  {name: 'NANO X 2D79', id: 4},
  {name: 'NANO X 9F42', id: 5},
]

type Props = {
  visible: any,
  onRequestClose: any,
  defaultDevices: any,
  useUSB: any,
}
const LedgerConnectModal = ({visible, onRequestClose, defaultDevices, useUSB}: Props) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
    <LedgerConnect
      onConnectBLE={() => ({})}
      onConnectUSB={() => ({})}
      useUSB={useUSB}
      onWaitingMessage={''}
      defaultDevices={defaultDevices}
    />
  </Modal>
)

storiesOf('Ledger connect', module)
  .addDecorator(withModalProps)
  .add('Using BLE', ({visible, onRequestClose}) => (
    <LedgerConnectModal onRequestClose={onRequestClose} visible={visible} useUSB={false} defaultDevices={undefined} />
  ))
  .add('Using USB', ({visible, onRequestClose}) => (
    <LedgerConnectModal onRequestClose={onRequestClose} visible={visible} useUSB defaultDevices={undefined} />
  ))
  .add('BLE with many devices', ({visible, onRequestClose}) => (
    <LedgerConnectModal onRequestClose={onRequestClose} visible={visible} defaultDevices={devices} useUSB={false} />
  ))
