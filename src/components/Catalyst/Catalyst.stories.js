// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import {WithModalProps} from '../../../storybook/decorators'

import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Step5 from './Step5'
import Step6 from './Step6'
import {CONFIG} from '../../config/config'
import {strToDefaultMultiAsset} from '../../crypto/MultiToken'
import CatalystBackupCheckModal from './CatalystBackupCheckModal'
import Dialog, {DIALOG_STEPS} from './Dialog'

const fee = strToDefaultMultiAsset('173921', CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID)

const encryptedKey =
  '0100af1a78621391225073b608d100878c472c1bfd2edf9993bd1d1' +
  'cbce0fa25f563ff90cb1c404a7eb7cb3b148012d112de7ac3dd85143f146a57298775855ae' +
  'b0f669b303a8e33a94126caa45fd05ebbb10fc186e6488e61be1afbe756b9db9e5bf5a32dd' +
  '713beb3811385ab'

const mockUnsignedTx = {
  fee: () => Promise.resolve(fee),
}

storiesOf('Catalyst', module)
  .add('Step 1', () => <Step1 />)
  .add('Step 2', () => <Step2 />)
  .add('Step 3', () => <Step3 />)
  .add('Step 4', () => <Step4 />)
  .add('Step 5', () => <Step5 unsignedTx={mockUnsignedTx} />)
  .add('Step 5 - HW wallet', () => <Step5 unsignedTx={mockUnsignedTx} isHW />)
  .add('Step 6', () => <Step6 encryptedKey={encryptedKey} />)
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
