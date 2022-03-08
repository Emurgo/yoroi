import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../../storybook'
import {Dialog, Step} from './Dialog'

storiesOf('Dialog', module)
  .add('step/CHOOSE_TRANSPORT', () => {
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
  .add('step/ERROR', () => {
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
  .add('step/LEDGER_CONNECT', () => {
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
  .add('step/SUBMITTING', () => {
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
            step={visible ? Step.Submitting : Step.Closed}
          />
        )}
      </WithModalProps>
    )
  })
  .add('step/SIGNING', () => {
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
            step={visible ? Step.Signing : Step.Closed}
          />
        )}
      </WithModalProps>
    )
  })
  .add('step/WAITING_HW_RESPONSE', () => {
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
