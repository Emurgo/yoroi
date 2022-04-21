import {BigNumber} from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import {DangerousAction, ErrorView, Modal, PleaseWaitView, Spacer} from '../../../components'
import {LedgerConnect, LedgerTransportSwitch} from '../../../HW'
import globalMessages, {ledgerMessages} from '../../../i18n/global-messages'
import {DeviceObj} from '../../../legacy/ledgerUtils'
import {theme} from '../../../theme'
import {TxDeregistration, TxWithdrawal} from '../../../yoroi-wallets'
import {WithdrawalDialogSteps} from '../WithdrawStakingRewards'
import {TransferSummary} from './TransferSummary'

type Props = {
  step: WithdrawalDialogSteps
  onKeepKey: () => void
  onDeregisterKey: () => void
  onChooseTransport: (bool: boolean) => void
  onConnectBLE: (deviceId: string) => void
  onConnectUSB: (deviceObj: DeviceObj) => void
  withdrawals: null | Array<TxWithdrawal>
  deregistrations: null | Array<TxDeregistration>
  balance: BigNumber
  finalBalance: BigNumber
  fees: BigNumber
  onConfirm: (password?: string | undefined) => void
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
      case WithdrawalDialogSteps.CLOSED:
        return null
      case WithdrawalDialogSteps.WARNING:
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
      case WithdrawalDialogSteps.CHOOSE_TRANSPORT:
        return (
          <LedgerTransportSwitch
            onSelectUSB={() => onChooseTransport(true)}
            onSelectBLE={() => onChooseTransport(false)}
          />
        )
      case WithdrawalDialogSteps.LEDGER_CONNECT:
        return <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={useUSB} />
      case WithdrawalDialogSteps.CONFIRM:
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
      case WithdrawalDialogSteps.WAITING_HW_RESPONSE:
        return <PleaseWaitView title="" spinnerText={strings.followSteps} />
      case WithdrawalDialogSteps.WAITING:
        return <PleaseWaitView title="" spinnerText={strings.pleaseWait} />
      case WithdrawalDialogSteps.ERROR:
        if (!error) throw new Error("Invalid state: 'error' is undefined")
        return <ErrorView errorMessage={error.errorMessage} errorLogs={error.errorLogs} onDismiss={onRequestClose} />
      default:
        return null
    }
  }
  if (step === WithdrawalDialogSteps.CLOSED) return null
  return (
    <Modal
      visible
      onRequestClose={onRequestClose}
      showCloseIcon={step !== WithdrawalDialogSteps.WAITING_HW_RESPONSE && step !== WithdrawalDialogSteps.WAITING}
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
