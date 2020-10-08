// @flow

import {BigNumber} from 'bignumber.js'
import React from 'react'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Modal, PleaseWaitModal} from '../UiKit'
import DangerousActionModal from '../Common/DangerousActionModal'
import TransferSummaryModal from '../Transfer/TransferSummaryModal'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import LedgerConnect from '../Ledger/LedgerConnect'
import globalMessages, {ledgerMessages} from '../../i18n/global-messages'
import {WITHDRAWAL_DIALOG_STEPS, type WithdrawalDialogSteps} from './types'

import styles from './styles/WithdrawalDialog.style'

import type {ComponentType} from 'react'

const messages = defineMessages({
  warningModalTitle: {
    id: 'components.delegation.withdrawaldialog.warningModalTitle',
    defaultMessage: '!!!Also deregister staking key?',
  },
  explanation1: {
    id: 'components.delegation.withdrawaldialog.explanation1',
    defaultMessage:
      '!!!When withdrawing rewards, you also have the option to deregister ' +
      'the staking key.',
  },
  explanation2: {
    id: 'components.delegation.withdrawaldialog.explanation2',
    defaultMessage:
      '!!!Keeping the staking key will allow you to withdraw the rewards, ' +
      'but continue delegating to the same pool.',
  },
  explanation3: {
    id: 'components.delegation.withdrawaldialog.explanation3',
    defaultMessage:
      '!!!Deregistering the staking key will give you back your deposit and ' +
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
  +intl: intlShape,
  +step: WithdrawalDialogSteps,
  +onKeepKey: () => any,
  +onDeregisterKey: () => any,
  +onChooseTransport: (Object, boolean) => any,
  +onConnectBLE: () => any,
  +onConnectUSB: () => any,
  +withdrawals?: ?Array<{|
    +address: string,
    +amount: BigNumber,
  |}>,
  +deregistrations?: ?Array<{|
    +rewardAddress: string,
    +refund: BigNumber,
  |}>,
  +balance: BigNumber,
  +finalBalance: BigNumber,
  +fees: BigNumber,
  +onConfirm: (event: Object, password?: string) => mixed,
  +onRequestClose: () => any,
  +useUSB: boolean,
  +showCloseIcon?: boolean,
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
  showCloseIcon,
}: Props) => {
  switch (step) {
    case WITHDRAWAL_DIALOG_STEPS.CLOSED:
      return null
    case WITHDRAWAL_DIALOG_STEPS.WARNING:
      return (
        <DangerousActionModal
          visible
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
          showCloseIcon
        >
          <Text style={styles.paragraph}>
            {intl.formatMessage(messages.explanation1)}
          </Text>
          <Text style={styles.paragraph}>
            {intl.formatMessage(messages.explanation2)}
          </Text>
          <Text style={styles.paragraph}>
            {intl.formatMessage(messages.explanation3)}
          </Text>
        </DangerousActionModal>
      )
    case WITHDRAWAL_DIALOG_STEPS.CHOOSE_TRANSPORT:
      return (
        <LedgerTransportSwitchModal
          visible
          onRequestClose={onRequestClose}
          onSelectUSB={(event) => onChooseTransport(event, true)}
          onSelectBLE={(event) => onChooseTransport(event, false)}
          showCloseIcon
        />
      )
    case WITHDRAWAL_DIALOG_STEPS.LEDGER_CONNECT:
      return (
        <Modal visible onRequestClose={onRequestClose} showCloseIcon>
          <LedgerConnect
            onConnectBLE={onConnectBLE}
            onConnectUSB={onConnectUSB}
            useUSB={useUSB}
          />
        </Modal>
      )
    case WITHDRAWAL_DIALOG_STEPS.CONFIRM:
      return (
        <TransferSummaryModal
          visible
          onRequestClose={onRequestClose}
          disableButtons={false}
          withdrawals={withdrawals}
          deregistrations={deregistrations}
          balance={balance}
          finalBalance={finalBalance}
          fees={fees}
          onConfirm={onConfirm}
          showCloseIcon
          useUSB={useUSB}
        />
      )
    case WITHDRAWAL_DIALOG_STEPS.WAITING_HW_RESPONSE:
      return (
        <PleaseWaitModal
          visible
          title={''}
          spinnerText={intl.formatMessage(ledgerMessages.followSteps)}
        />
      )
    case WITHDRAWAL_DIALOG_STEPS.WAITING:
      return (
        <PleaseWaitModal
          visible
          title={''}
          spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
        />
      )
    default:
      return null
  }
}

export default injectIntl((WithdrawalDialog: ComponentType<Props>))
