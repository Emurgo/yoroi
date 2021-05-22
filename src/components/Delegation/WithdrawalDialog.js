// @flow

import {BigNumber} from 'bignumber.js'
import React from 'react'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import Markdown from 'react-native-easy-markdown'

import {Modal} from '../UiKit'
import {DangerousAction} from '../Common/DangerousActionModal'
import {ErrorView} from '../Common/ErrorModal'
import {PleaseWaitView} from '../UiKit/PleaseWaitModal'
import TransferSummary from '../Transfer/TransferSummary'
import {LedgerTransportSwitch} from '../Ledger/LedgerTransportSwitchModal'
import LedgerConnect from '../Ledger/LedgerConnect'
import globalMessages, {ledgerMessages} from '../../i18n/global-messages'
import {MultiToken} from '../../crypto/MultiToken'
import {WITHDRAWAL_DIALOG_STEPS, type WithdrawalDialogSteps} from './types'

import styles from './styles/WithdrawalDialog.style'

const messages = defineMessages({
  warningModalTitle: {
    id: 'components.delegation.withdrawaldialog.warningModalTitle',
    defaultMessage: '!!!Also deregister staking key?',
  },
  explanation1: {
    id: 'components.delegation.withdrawaldialog.explanation1',
    defaultMessage:
      '!!!When **withdrawing rewards**, you also have the option to deregister ' +
      'the staking key.',
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
      '!!!**Deregistering the staking key** will give you back your deposit and ' +
      'undelegate the key from any pool.',
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

type Props = {|
  +intl: IntlShape,
  +step: WithdrawalDialogSteps,
  +onKeepKey: () => any,
  +onDeregisterKey: () => any,
  +onChooseTransport: (Object, boolean) => any,
  +onConnectBLE: () => any,
  +onConnectUSB: () => any,
  +withdrawals?: ?Array<{|
    +address: string,
    +amount: MultiToken,
  |}>,
  +deregistrations?: ?Array<{|
    +rewardAddress: string,
    +refund: MultiToken,
  |}>,
  +balance: BigNumber,
  +finalBalance: BigNumber,
  +fees: BigNumber,
  +onConfirm: (event: Object, password?: string) => mixed,
  +onRequestClose: () => any,
  +useUSB: boolean,
  +showCloseIcon?: boolean,
  +error: {
    +errorMessage: ?string,
    +errorLogs?: ?string,
  },
|}

const WithdrawalDialog = ({
  intl,
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
  const getModalBody = () => {
    switch (step) {
      case WITHDRAWAL_DIALOG_STEPS.CLOSED:
        return null
      case WITHDRAWAL_DIALOG_STEPS.WARNING:
        return (
          <DangerousAction
            title={intl.formatMessage(messages.warningModalTitle)}
            alertBox={{
              content: [
                intl.formatMessage(messages.warning1),
                intl.formatMessage(messages.warning2),
                intl.formatMessage(messages.warning3),
              ],
            }}
            onRequestClose={onRequestClose}
            primaryButton={{
              label: intl.formatMessage(messages.keepButton),
              onPress: onKeepKey,
            }}
            secondaryButton={{
              label: intl.formatMessage(messages.deregisterButton),
              onPress: onDeregisterKey,
            }}
          >
            {[
              messages.explanation1,
              messages.explanation2,
              messages.explanation3,
            ].map((msg, i) => (
              <Markdown key={i} style={styles.paragraph}>
                {intl.formatMessage(msg)}
              </Markdown>
            ))}
          </DangerousAction>
        )
      case WITHDRAWAL_DIALOG_STEPS.CHOOSE_TRANSPORT:
        return (
          // $FlowFixMe
          <LedgerTransportSwitch
            onSelectUSB={(event) => onChooseTransport(event, true)}
            onSelectBLE={(event) => onChooseTransport(event, false)}
          />
        )
      case WITHDRAWAL_DIALOG_STEPS.LEDGER_CONNECT:
        return (
          // $FlowFixMe
          <LedgerConnect
            onConnectBLE={onConnectBLE}
            onConnectUSB={onConnectUSB}
            useUSB={useUSB}
          />
        )
      case WITHDRAWAL_DIALOG_STEPS.CONFIRM:
        return (
          // $FlowFixMe
          <TransferSummary
            // $FlowFixMe
            withdrawals={withdrawals}
            // $FlowFixMe
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
        return (
          <PleaseWaitView
            title={''}
            spinnerText={intl.formatMessage(ledgerMessages.followSteps)}
          />
        )
      case WITHDRAWAL_DIALOG_STEPS.WAITING:
        return (
          <PleaseWaitView
            title={''}
            spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
          />
        )
      case WITHDRAWAL_DIALOG_STEPS.ERROR:
        return (
          <ErrorView
            // $FlowFixMe
            errorMessage={error.errorMessage}
            errorLogs={error.errorLogs}
            onDismiss={onRequestClose}
          />
        )
      default:
        return null
    }
  }
  if (step === WITHDRAWAL_DIALOG_STEPS.CLOSED) return null
  return (
    <Modal
      visible
      onRequestClose={onRequestClose}
      showCloseIcon={
        step !== WITHDRAWAL_DIALOG_STEPS.WAITING_HW_RESPONSE &&
        step !== WITHDRAWAL_DIALOG_STEPS.WAITING
      }
    >
      {getModalBody()}
    </Modal>
  )
}

export default injectIntl(WithdrawalDialog)
