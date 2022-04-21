/**
 * Step 5 for the Catalyst registration
 * Ask password used for signing transaction or sign with HW wallet
 * submit the transaction
 */

import React from 'react'
import {useIntl} from 'react-intl'

import {ErrorView, Modal, PleaseWaitView} from '../components'
import {LedgerConnect, LedgerTransportSwitch} from '../HW'
import globalMessages, {ledgerMessages, txLabels} from '../i18n/global-messages'
import type {DeviceId, DeviceObj} from '../legacy/ledgerUtils'

type ErrorData = {
  errorMessage: string
  errorLogs?: string
}

export const DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  CHOOSE_TRANSPORT: 'CHOOSE_TRANSPORT',
  LEDGER_CONNECT: 'LEDGER_CONNECT',
  ERROR: 'ERROR',
  SUBMITTING: 'SUBMITTING',
  WAITING_HW_RESPONSE: 'WAITING_HW_RESPONSE',
}
export type DialogStep = typeof DIALOG_STEPS[keyof typeof DIALOG_STEPS]

type DialogProps = {
  step: DialogStep
  onRequestClose: () => void
  onChooseTransport: (bool: boolean) => void
  onConnectBLE: (id: DeviceId) => void
  onConnectUSB: (obj: DeviceObj) => void
  useUSB: boolean
  errorData: ErrorData
}
export const Dialog = ({
  step,
  onRequestClose,
  onChooseTransport,
  onConnectBLE,
  onConnectUSB,
  useUSB,
  errorData,
}: DialogProps) => {
  const strings = useStrings()
  const getBody = () => {
    switch (step) {
      case DIALOG_STEPS.CLOSED:
        return null
      case DIALOG_STEPS.CHOOSE_TRANSPORT:
        return (
          <LedgerTransportSwitch
            onSelectUSB={() => onChooseTransport(true)}
            onSelectBLE={() => onChooseTransport(false)}
          />
        )
      case DIALOG_STEPS.LEDGER_CONNECT:
        return <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={useUSB} />
      case DIALOG_STEPS.WAITING_HW_RESPONSE:
        return <PleaseWaitView title="" spinnerText={strings.followSteps} />
      case DIALOG_STEPS.SUBMITTING:
        return <PleaseWaitView title={strings.submittingTx} spinnerText={strings.pleaseWait} />
      case DIALOG_STEPS.ERROR:
        return (
          <ErrorView errorMessage={errorData.errorMessage} errorLogs={errorData.errorLogs} onDismiss={onRequestClose} />
        )
      default:
        return null
    }
  }
  return (
    <Modal
      visible={step !== DIALOG_STEPS.CLOSED}
      onRequestClose={onRequestClose}
      showCloseIcon={step !== DIALOG_STEPS.WAITING_HW_RESPONSE && step !== DIALOG_STEPS.SUBMITTING}
    >
      {getBody()}
    </Modal>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    followSteps: intl.formatMessage(ledgerMessages.followSteps),
    submittingTx: intl.formatMessage(txLabels.submittingTx),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
  }
}
