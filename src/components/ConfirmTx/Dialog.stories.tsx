import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../../storybook'
import {Dialog, Step} from './Dialog'

storiesOf('Dialog', module)
  .add('Choose Transport', () => {
    return (
      <WithModalProps>
        {({onRequestClose, visible}) => (
          <Dialog
            process="withLedger"
            onRequestClose={onRequestClose}
            onChooseTransport={onRequestClose}
            onConnectBLE={onRequestClose}
            onConnectUSB={onRequestClose}
            errorData={{
              errorMessage: 'errorMessage',
              errorLogs: 'errorLogs?',
            }}
            useUSB={visible}
            step={visible ? Step.ChooseTransport : Step.Closed}
          />
        )}
      </WithModalProps>
    )
  })
  .add('Error', () => {
    return (
      <WithModalProps>
        {({onRequestClose, visible}) => (
          <Dialog
            process="withLedger"
            onRequestClose={onRequestClose}
            onChooseTransport={onRequestClose}
            onConnectBLE={onRequestClose}
            onConnectUSB={onRequestClose}
            errorData={{
              errorMessage: 'errorMessage',
              errorLogs: 'errorLogs?',
            }}
            useUSB={visible}
            step={visible ? Step.Error : Step.Closed}
          />
        )}
      </WithModalProps>
    )
  })
  .add('Ledger Connect', () => {
    return (
      <WithModalProps>
        {({onRequestClose, visible}) => (
          <Dialog
            process="withLedger"
            onRequestClose={onRequestClose}
            onChooseTransport={onRequestClose}
            onConnectBLE={onRequestClose}
            onConnectUSB={onRequestClose}
            errorData={{
              errorMessage: 'errorMessage',
              errorLogs: 'errorLogs?',
            }}
            useUSB={visible}
            step={visible ? Step.LedgerConnect : Step.Closed}
          />
        )}
      </WithModalProps>
    )
  })
  .add('Submitting', () => {
    return (
      <WithModalProps autoClose>
        {({onRequestClose, visible}) => (
          <Dialog
            process="withLedger"
            onRequestClose={onRequestClose}
            onChooseTransport={onRequestClose}
            onConnectBLE={onRequestClose}
            onConnectUSB={onRequestClose}
            errorData={{
              errorMessage: 'errorMessage',
              errorLogs: 'errorLogs?',
            }}
            useUSB={visible}
            step={visible ? Step.Submitting : Step.Closed}
          />
        )}
      </WithModalProps>
    )
  })
  .add('Signing', () => {
    return (
      <WithModalProps autoClose>
        {({onRequestClose, visible}) => (
          <Dialog
            process="withLedger"
            onRequestClose={onRequestClose}
            onChooseTransport={onRequestClose}
            onConnectBLE={onRequestClose}
            onConnectUSB={onRequestClose}
            errorData={{
              errorMessage: 'errorMessage',
              errorLogs: 'errorLogs?',
            }}
            useUSB={visible}
            step={visible ? Step.Signing : Step.Closed}
          />
        )}
      </WithModalProps>
    )
  })
  .add('Waiting HW response', () => {
    return (
      <WithModalProps>
        {({onRequestClose, visible}) => (
          <Dialog
            process="withLedger"
            onRequestClose={onRequestClose}
            onChooseTransport={onRequestClose}
            onConnectBLE={onRequestClose}
            onConnectUSB={onRequestClose}
            errorData={{
              errorMessage: 'errorMessage',
              errorLogs: 'errorLogs?',
            }}
            useUSB={visible}
            step={visible ? Step.WaitingHwResponse : Step.Closed}
          />
        )}
      </WithModalProps>
    )
  })
