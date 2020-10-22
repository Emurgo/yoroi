// @flow

import React from 'react'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withStateHandlers} from 'recompose'
import {View} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'

import TwoActionView from '../Common/TwoActionView'
import AddressEntry from '../Common/AddressEntry'
import HWInstructions from '../Ledger/HWInstructions'
import {Text, ValidatedTextInput} from '../UiKit'
import {walletMetaSelector} from '../../selectors'
import {formatAda, formatAdaWithText} from '../../utils/format'
import {confirmationMessages, txLabels} from '../../i18n/global-messages'
import {CONFIG} from '../../config/config'
import {getNetworkConfigById} from '../../config/networks'

import styles from './styles/TransferSummary.style'

import type {ComponentType} from 'react'
import type {WalletMeta} from '../../state'

const messages = defineMessages({
  fromLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.fromLabel',
    defaultMessage: '!!!From',
  },
  balanceLabel: {
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.balanceLabel',
    defaultMessage: '!!!Recovered balance',
  },
  finalBalanceLabel: {
    id:
      'components.walletinit.restorewallet.upgradeconfirmmodal.finalBalanceLabel',
    defaultMessage: '!!!Final balance',
  },
  unregisterExplanation: {
    id: 'components.transfer.transfersummarymodal.unregisterExplanation',
    defaultMessage:
      '!!!This transaction will unregister one or more staking ' +
      'keys, giving you back your {refundAmount} ADA from your deposit',
  },
})

type Props = {
  +intl: any,
  password: string,
  +setPassword: (string) => void,
  +withdrawals?: Array<{|
    +address: string,
    +amount: BigNumber,
  |}>,
  +deregistrations?: Array<{|
    +rewardAddress: string,
    +refund: BigNumber,
  |}>,
  +balance: BigNumber,
  +finalBalance: BigNumber,
  +fees: BigNumber,
  +onConfirm: (event: Object, password?: string) => mixed,
  +onCancel: () => mixed,
  +walletMeta: $Diff<WalletMeta, {id: string}>,
  +useUSB?: boolean,
}

const TransferSummary = ({
  intl,
  password,
  setPassword,
  withdrawals,
  deregistrations,
  balance,
  finalBalance,
  fees,
  onConfirm,
  onCancel,
  walletMeta,
  useUSB,
}: Props) => (
  <TwoActionView
    title={intl.formatMessage(txLabels.confirmTx)}
    primaryButton={{
      label: intl.formatMessage(
        confirmationMessages.commonButtons.confirmButton,
      ),
      onPress: (event) => onConfirm(event, password),
    }}
    secondaryButton={{
      onPress: onCancel,
    }}
  >
    <View style={styles.item}>
      <Text>{intl.formatMessage(messages.balanceLabel)}</Text>
      <Text style={styles.balanceAmount}>{formatAdaWithText(balance)}</Text>
    </View>
    <View style={styles.item}>
      <Text>{intl.formatMessage(txLabels.fees)}</Text>
      <Text style={styles.balanceAmount}>{formatAdaWithText(fees)}</Text>
    </View>
    <View style={styles.item}>
      <Text>{intl.formatMessage(messages.finalBalanceLabel)}</Text>
      <Text style={styles.balanceAmount}>
        {formatAdaWithText(finalBalance)}
      </Text>
    </View>
    {/* eslint-disable indent */
    withdrawals != null &&
      withdrawals.length > 0 && (
        <View style={styles.item}>
          <Text>{intl.formatMessage(txLabels.withdrawals)}</Text>
          {withdrawals.map((withdrawal, i) => (
            <AddressEntry
              key={i}
              address={withdrawal.address}
              explorerForAddress={
                getNetworkConfigById(walletMeta.networkId)
                  .EXPLORER_URL_FOR_ADDRESS
              }
            />
          ))}
        </View>
      )}
    {deregistrations != null &&
      deregistrations.length > 0 && (
        <>
          <View style={styles.item}>
            <Text>{intl.formatMessage(txLabels.stakeDeregistration)}</Text>
            {deregistrations.map((deregistration, i) => (
              <AddressEntry
                key={i}
                address={deregistration.rewardAddress}
                explorerForAddress={
                  getNetworkConfigById(walletMeta.networkId)
                    .EXPLORER_URL_FOR_ADDRESS
                }
              />
            ))}
          </View>
          <View style={styles.item}>
            <Text>
              {intl.formatMessage(messages.unregisterExplanation, {
                refundAmount: formatAda(
                  deregistrations.reduce(
                    (sum, curr) =>
                      curr.refund == null ? sum : sum.plus(curr.refund),
                    new BigNumber(0),
                  ),
                ).toString(),
              })}
            </Text>
          </View>
        </>
      )
    /* eslint-enable indent */
    }

    {walletMeta.isHW && <HWInstructions useUSB={useUSB} addMargin />}

    {/* eslint-disable indent */
    !walletMeta.isEasyConfirmationEnabled &&
      !walletMeta.isHW && (
        <View style={styles.input}>
          <ValidatedTextInput
            secureTextEntry
            value={password}
            label={intl.formatMessage(txLabels.password)}
            onChangeText={setPassword}
          />
        </View>
      )
    /* eslint-enable indent */
    }
  </TwoActionView>
)

type ExternalProps = {|
  +intl: any,
  +withdrawals?: Array<{|
    +address: string,
    +amount: BigNumber,
  |}>,
  +deregistrations?: Array<{|
    +rewardAddress: string,
    +refund: BigNumber,
  |}>,
  +balance: BigNumber,
  +finalBalance: BigNumber,
  +fees: BigNumber,
  +onConfirm: (password?: string) => mixed,
  +onCancel: () => mixed,
|}

export default injectIntl(
  (compose(
    connect((state) => ({
      walletMeta: walletMetaSelector(state),
    })),
    withStateHandlers(
      {
        password: CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.PASSWORD : '',
      },
      {
        setPassword: () => (value) => ({password: value}),
      },
    ),
  )(TransferSummary): ComponentType<ExternalProps>),
)
