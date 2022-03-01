import {BigNumber} from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import type {WithdrawalDialogSteps} from '../../../../legacy/components/Delegation/types'
import {WITHDRAWAL_DIALOG_STEPS} from '../../../../legacy/components/Delegation/types'
import {Modal} from '../../../../legacy/components/UiKit'
import {PleaseWaitView} from '../../../../legacy/components/UiKit/PleaseWaitModal'
import {MultiToken} from '../../../../legacy/crypto/MultiToken'
import globalMessages, {ledgerMessages} from '../../../../legacy/i18n/global-messages'
import {theme} from '../../../../legacy/styles/config'
import {DangerousAction, Spacer} from '../../../components'
import {ErrorView} from '../../../components'
import {LedgerTransportSwitch} from '../../../HW'
import {LedgerConnect} from '../../../HW'
import {TransferSummary} from './TransferSummary'

export type Withdrawal = {
  address: string
  amount: MultiToken
}

export type Deregistration = {
  rewardAddress: string
  refund: MultiToken
}

type Props = {
  step: WithdrawalDialogSteps
  onKeepKey: () => void
  onDeregisterKey: () => void
  onChooseTransport: (bool: boolean) => void
  onConnectBLE: (...args: unknown[]) => void
  onConnectUSB: (...args: unknown[]) => void
  withdrawals: null | Array<Withdrawal>
  deregistrations: null | Array<Deregistration>
  balance: BigNumber
  finalBalance: BigNumber
  fees: BigNumber
  onConfirm: (password?: string | void) => void
  onRequestClose: () => void
  useUSB: boolean
  showCloseIcon?: boolean
  error:
    | undefined
    | {
        errorMessage: string
        errorLogs: string | null
      }
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
  error,
}: Props) => {
  const strings = useStrings()

  const getModalBody = () => {
    switch (step) {
      case WITHDRAWAL_DIALOG_STEPS.CLOSED:
        return null
      case WITHDRAWAL_DIALOG_STEPS.WARNING:
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
      case WITHDRAWAL_DIALOG_STEPS.CHOOSE_TRANSPORT:
        return (
          <LedgerTransportSwitch
            onSelectUSB={() => onChooseTransport(true)}
            onSelectBLE={() => onChooseTransport(false)}
          />
        )
      case WITHDRAWAL_DIALOG_STEPS.LEDGER_CONNECT:
        return <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={useUSB} />
      case WITHDRAWAL_DIALOG_STEPS.CONFIRM:
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
      case WITHDRAWAL_DIALOG_STEPS.WAITING_HW_RESPONSE:
        return <PleaseWaitView title={''} spinnerText={strings.followSteps} />
      case WITHDRAWAL_DIALOG_STEPS.WAITING:
        return <PleaseWaitView title={''} spinnerText={strings.pleaseWait} />
      case WITHDRAWAL_DIALOG_STEPS.ERROR:
        if (!error) throw new Error("Invalid state: 'error' is undefined")
        return <ErrorView errorMessage={error.errorMessage} errorLogs={error.errorLogs} onDismiss={onRequestClose} />
      default:
        return null
    }
  }
  if (step === WITHDRAWAL_DIALOG_STEPS.CLOSED) return null
  return (
    <Modal
      visible
      onRequestClose={onRequestClose}
      showCloseIcon={step !== WITHDRAWAL_DIALOG_STEPS.WAITING_HW_RESPONSE && step !== WITHDRAWAL_DIALOG_STEPS.WAITING}
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
