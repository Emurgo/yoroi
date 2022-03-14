import {BigNumber} from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import globalMessages, {ledgerMessages} from '../../../../legacy/i18n/global-messages'
import {theme} from '../../../../legacy/styles/config'
import {DangerousAction, ErrorData, ErrorView, Modal, PleaseWaitView, Spacer} from '../../../components'
import {LedgerConnect, LedgerTransportSwitch} from '../../../HW'
import {SignRequestDeregistration, SignRequestWithdrawal} from '../../../types/cardano'
import {TransferSummary} from './TransferSummary'

export enum Steps {
  Closed,
  Warning,
  ChooseTransport,
  LedgerConnect,
  Confirm,
  WaitingHwResponse,
  Waiting,
  Error,
}

type Props = {
  step: Steps
  onKeepKey: () => void
  onDeregisterKey: () => void
  onChooseTransport: (bool: boolean) => void
  onConnectBLE: (...args: unknown[]) => void
  onConnectUSB: (...args: unknown[]) => void
  withdrawals: null | Array<SignRequestWithdrawal>
  deregistrations: null | Array<SignRequestDeregistration>
  balance: BigNumber
  finalBalance: BigNumber
  fees: BigNumber
  onConfirm: (password?: string | void) => void
  onRequestClose: () => void
  useUSB: boolean
  showCloseIcon?: boolean
  error: undefined | ErrorData
}

export const WithdrawalDialog = ({
  step,
  onKeepKey,
  onDeregisterKey,
  onChooseTransport,
  useUSB,
  onConnectBLE,
  onConnectUSB,
  withdrawals,
  deregistrations,
  balance,
  finalBalance,
  fees,
  onConfirm,
  onRequestClose,
  error: errorData,
}: Props) => {
  const strings = useStrings()

  const getModalBody = () => {
    switch (step) {
      case Steps.Closed:
        return null
      case Steps.Warning:
        return (
          <DangerousAction
            title={strings.warningModalTitle}
            alertBox={{
              content: [strings.warning1, strings.warning2, strings.warning3],
            }}
            primaryButton={{
              label: strings.keepButton,
              onPress: onKeepKey,
            }}
            secondaryButton={{
              label: strings.deregisterButton,
              onPress: onDeregisterKey,
            }}
          >
            <Markdown style={styles.paragraph}>{strings.explanation1}</Markdown>
            <Spacer height={8} />
            <Markdown style={styles.paragraph}>{strings.explanation2}</Markdown>
            <Spacer height={8} />
            <Markdown style={styles.paragraph}>{strings.explanation3}</Markdown>
          </DangerousAction>
        )
      case Steps.ChooseTransport:
        return (
          <LedgerTransportSwitch
            onSelectUSB={() => onChooseTransport(true)}
            onSelectBLE={() => onChooseTransport(false)}
          />
        )
      case Steps.LedgerConnect:
        return <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={useUSB} />
      case Steps.Confirm:
        return (
          <TransferSummary
            withdrawals={withdrawals}
            deregistrations={deregistrations}
            balance={balance}
            finalBalance={finalBalance}
            fees={fees}
            onConfirm={onConfirm}
            onCancel={onRequestClose}
            useUSB={useUSB}
          />
        )
      case Steps.WaitingHwResponse:
        return <PleaseWaitView title={''} spinnerText={strings.followSteps} />
      case Steps.Waiting:
        return <PleaseWaitView title={''} spinnerText={strings.pleaseWait} />
      case Steps.Error:
        if (!errorData) throw new Error("Invalid state: 'error' is undefined")
        return <ErrorView errorData={errorData} onDismiss={onRequestClose} />
      default:
        return null
    }
  }
  if (step === Steps.Closed) return null
  return (
    <Modal
      visible
      onRequestClose={onRequestClose}
      showCloseIcon={step !== Steps.WaitingHwResponse && step !== Steps.Waiting}
    >
      {getModalBody()}
    </Modal>
  )
}

const styles = StyleSheet.create({
  paragraph: {
    ...theme.text,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    warningModalTitle: intl.formatMessage(messages.warningModalTitle),
    warning1: intl.formatMessage(messages.warning1),
    warning2: intl.formatMessage(messages.warning2),
    warning3: intl.formatMessage(messages.warning3),
    keepButton: intl.formatMessage(messages.keepButton),
    deregisterButton: intl.formatMessage(messages.deregisterButton),
    explanation1: intl.formatMessage(messages.explanation1),
    explanation2: intl.formatMessage(messages.explanation2),
    explanation3: intl.formatMessage(messages.explanation3),
    followSteps: intl.formatMessage(ledgerMessages.followSteps),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
  }
}

const messages = defineMessages({
  warningModalTitle: {
    id: 'components.delegation.withdrawaldialog.warningModalTitle',
    defaultMessage: '!!!Also deregister staking key?',
  },
  explanation1: {
    id: 'components.delegation.withdrawaldialog.explanation1',
    defaultMessage: '!!!When **withdrawing rewards**, you also have the option to deregister the staking key.',
  },
  explanation2: {
    id: 'components.delegation.withdrawaldialog.explanation2',
    defaultMessage:
      '!!!**Keeping the staking key** will allow you to withdraw the rewards, ' +
      'but continue delegating to the same pool.',
  },
  explanation3: {
    id: 'components.delegation.withdrawaldialog.explanation3',
    defaultMessage:
      '!!!**Deregistering the staking key** will give you back your deposit and undelegate the key from any pool.',
  },
  warning1: {
    id: 'components.delegation.withdrawaldialog.warning1',
    defaultMessage:
      '!!!You do NOT need to deregister to delegate to a different stake ' +
      'pool. You can change your delegation preference at any time.',
  },
  warning2: {
    id: 'components.delegation.withdrawaldialog.warning2',
    defaultMessage:
      '!!!You should NOT deregister if this staking key is used as a stake ' +
      "pool's reward account, as this will cause all pool operator rewards " +
      'to be sent back to the reserve.',
  },
  warning3: {
    id: 'components.delegation.withdrawaldialog.warning3',
    defaultMessage:
      '!!!Deregistering means this key will no longer receive rewards until ' +
      'you re-register the staking key (usually by delegating to a pool again)',
  },
  keepButton: {
    id: 'components.delegation.withdrawaldialog.keepButton',
    defaultMessage: '!!!Keep registered',
  },
  deregisterButton: {
    id: 'components.delegation.withdrawaldialog.deregisterButton',
    defaultMessage: '!!!Deregister',
  },
})
