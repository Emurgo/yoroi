import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../storybook'
import {CatalystBackupCheckModal} from './CatalystBackupCheckModal'
import {Dialog, DIALOG_STEPS} from './Dialog'
import {Step1} from './Step1'
import {Step2} from './Step2'
import {Step3} from './Step3'
import {Step4} from './Step4'
import {Step5} from './Step5'
import {Step6} from './Step6'

storiesOf('Catalyst', module)
  .add('Step 1', () => <Step1 />)
  .add('Step 2', () => <Step2 />)
  .add('Step 3', () => <Step3 />)
  .add('Step 4', () => <Step4 />)
  .add('Step 5', () => <Step5 />)
  .add('Step 6', () => <Step6 />)
  .add('Dialog - USB - CLOSED', () => (
    <WithModalProps>
      {(modalProps) => (
        <Dialog
          {...modalProps}
          step={DIALOG_STEPS.CLOSED}
          onChooseTransport={action('onChooseTransport')}
          onConnectBLE={action('onConnectBLE')}
          onConnectUSB={action('onConnectUSB')}
          useUSB
          errorData={{
            errorMessage: 'errorMessage',
            errorLogs: 'errorLogs',
          }}
        />
      )}
    </WithModalProps>
  ))
  .add('Dialog - USB - CHOOSE_TRANSPORT', () => (
    <WithModalProps>
      {(modalProps) => (
        <Dialog
          {...modalProps}
          step={DIALOG_STEPS.CHOOSE_TRANSPORT}
          onChooseTransport={action('onChooseTransport')}
          onConnectBLE={action('onConnectBLE')}
          onConnectUSB={action('onConnectUSB')}
          useUSB
          errorData={{
            errorMessage: 'errorMessage',
            errorLogs: 'errorLogs',
          }}
        />
      )}
    </WithModalProps>
  ))
  .add('Dialog - USB - LEDGER_CONNECT', () => (
    <WithModalProps>
      {(modalProps) => (
        <Dialog
          {...modalProps}
          step={DIALOG_STEPS.LEDGER_CONNECT}
          onChooseTransport={action('onChooseTransport')}
          onConnectBLE={action('onConnectBLE')}
          onConnectUSB={action('onConnectUSB')}
          useUSB
          errorData={{
            errorMessage: 'errorMessage',
            errorLogs: 'errorLogs',
          }}
        />
      )}
    </WithModalProps>
  ))
  .add('Dialog - USB - ERROR', () => (
    <WithModalProps>
      {(modalProps) => (
        <Dialog
          {...modalProps}
          step={DIALOG_STEPS.ERROR}
          onChooseTransport={action('onChooseTransport')}
          onConnectBLE={action('onConnectBLE')}
          onConnectUSB={action('onConnectUSB')}
          useUSB
          errorData={{
            errorMessage: 'errorMessage',
            errorLogs: 'errorLogs',
          }}
        />
      )}
    </WithModalProps>
  ))
  .add('Dialog - USB - SUBMITTING', () => (
    <WithModalProps>
      {(modalProps) => (
        <Dialog
          {...modalProps}
          step={DIALOG_STEPS.SUBMITTING}
          onChooseTransport={action('onChooseTransport')}
          onConnectBLE={action('onConnectBLE')}
          onConnectUSB={action('onConnectUSB')}
          useUSB
          errorData={{
            errorMessage: 'errorMessage',
            errorLogs: 'errorLogs',
          }}
        />
      )}
    </WithModalProps>
  ))
  .add('Dialog - USB - WAITING_HW_RESPONSE', () => (
    <WithModalProps>
      {(modalProps) => (
        <Dialog
          {...modalProps}
          step={DIALOG_STEPS.WAITING_HW_RESPONSE}
          onChooseTransport={action('onChooseTransport')}
          onConnectBLE={action('onConnectBLE')}
          onConnectUSB={action('onConnectUSB')}
          useUSB
          errorData={{
            errorMessage: 'errorMessage',
            errorLogs: 'errorLogs',
          }}
        />
      )}
    </WithModalProps>
  ))
  .add('CatalystBackupCheckModal', () => (
    <WithModalProps>
      {(modalProps) => <CatalystBackupCheckModal {...modalProps} onConfirm={action('onConfirm')} />}
    </WithModalProps>
  ))
