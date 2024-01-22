import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Linking, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'

import {Text} from '../../../components'
import {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import {formatTokenWithText} from '../../../legacy/format'
import {COLORS} from '../../../theme'
import {getNetworkConfigById} from '../../../yoroi-wallets/cardano/networks'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {YoroiStaking, YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {Amounts, Entries} from '../../../yoroi-wallets/utils'

export const TransferSummary = ({wallet, unsignedTx}: {wallet: YoroiWallet; unsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const {deregistrations, withdrawals, refundAmount, feeAmount, totalAmount} = withdrawalInfo(
    unsignedTx,
    wallet.primaryToken.identifier,
  )

  return (
    <>
      <Item>
        <Text>{strings.balanceLabel}</Text>

        <Text style={styles.balanceAmount} testID="recoveredBalanceText">
          {formatTokenWithText(refundAmount.quantity, wallet.primaryToken)}
        </Text>
      </Item>

      <Item>
        <Text>{strings.fees}</Text>

        <Text style={styles.balanceAmount} testID="feeAmountText">
          {formatTokenWithText(feeAmount.quantity, wallet.primaryToken)}
        </Text>
      </Item>

      <Item>
        <Text>{strings.finalBalanceLabel}</Text>

        <Text style={styles.balanceAmount} testID="totalAmountText">
          {formatTokenWithText(totalAmount.quantity, wallet.primaryToken)}
        </Text>
      </Item>

      {withdrawals && <Withdrawals wallet={wallet} withdrawals={withdrawals} />}

      {deregistrations && <Deregistrations wallet={wallet} deregistrations={deregistrations} />}
    </>
  )
}

const withdrawalInfo = (unsignedTx: YoroiUnsignedTx, primaryTokenId: string) => {
  const deregistrations = unsignedTx.staking?.deregistrations
  const withdrawals = unsignedTx.staking?.withdrawals
  const withdrawalAmounts = Entries.toAmounts(withdrawals ?? [])
  const deregistrationAmounts = Entries.toAmounts(deregistrations ?? [])
  const refundAmounts = Amounts.sum([withdrawalAmounts, deregistrationAmounts])
  const refundAmount = Amounts.getAmount(Amounts.sum([withdrawalAmounts, deregistrationAmounts]), primaryTokenId)
  const feeAmount = Amounts.getAmount(unsignedTx.fee, primaryTokenId)
  const totalAmount = Amounts.getAmount(Amounts.diff(refundAmounts, unsignedTx.fee), primaryTokenId)

  return {
    deregistrations,
    withdrawals,
    refundAmount,
    feeAmount,
    totalAmount,
  }
}

const Withdrawals = ({
  wallet,
  withdrawals,
}: {
  wallet: YoroiWallet
  withdrawals: NonNullable<YoroiStaking['withdrawals']>
}) => {
  const strings = useStrings()

  const addresses = Entries.toAddresses(withdrawals)
  if (addresses.length < 1) return null

  return (
    <Item>
      <Text>{strings.withdrawals}</Text>

      {Object.keys(withdrawals).map((address) => (
        <TouchableOpacity
          key={address}
          activeOpacity={0.5}
          onPress={() => Linking.openURL(getNetworkConfigById(wallet.networkId).EXPLORER_URL_FOR_ADDRESS(address))}
        >
          <Text numberOfLines={1} ellipsizeMode="middle" secondary>
            {address}
          </Text>
        </TouchableOpacity>
      ))}
    </Item>
  )
}

const Deregistrations = ({
  wallet,
  deregistrations,
}: {
  wallet: YoroiWallet
  deregistrations: NonNullable<YoroiStaking['deregistrations']>
}) => {
  const strings = useStrings()
  const refundAmounts = Entries.toAmounts(deregistrations)
  const primaryAmount = Amounts.getAmount(refundAmounts, '')

  const addresses = Entries.toAddresses(deregistrations)
  if (addresses.length < 1) return null

  return (
    <>
      <Item>
        <Text>{strings.stakeDeregistration}</Text>

        {addresses.map((address) => (
          <TouchableOpacity
            key={address}
            activeOpacity={0.5}
            onPress={() => Linking.openURL(getNetworkConfigById(wallet.networkId).EXPLORER_URL_FOR_ADDRESS(address))}
          >
            <Text numberOfLines={1} ellipsizeMode="middle" secondary>
              {address}
            </Text>
          </TouchableOpacity>
        ))}
      </Item>

      <Item>
        <Text>
          {strings.unregisterExplanation({
            refundAmount: formatTokenWithText(primaryAmount.quantity, wallet.primaryToken),
          })}
        </Text>
      </Item>
    </>
  )
}

const Item = (props: ViewProps) => <View {...props} style={styles.item} />

const useStrings = () => {
  const intl = useIntl()

  return {
    fromLabel: intl.formatMessage(messages.fromLabel),
    balanceLabel: intl.formatMessage(messages.balanceLabel),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    finalBalanceLabel: intl.formatMessage(messages.finalBalanceLabel),
    unregisterExplanation: (args: {refundAmount: string}) => intl.formatMessage(messages.unregisterExplanation, args),

    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
    fees: intl.formatMessage(txLabels.fees),
    withdrawals: intl.formatMessage(txLabels.withdrawals),
    stakeDeregistration: intl.formatMessage(txLabels.stakeDeregistration),
  }
}

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
    id: 'components.walletinit.restorewallet.upgradeconfirmmodal.finalBalanceLabel',
    defaultMessage: '!!!Final balance',
  },
  unregisterExplanation: {
    id: 'components.transfer.transfersummarymodal.unregisterExplanation',
    defaultMessage:
      '!!!This transaction will unregister one or more staking ' +
      'keys, giving you back your {refundAmount} from your deposit',
  },
})

const styles = StyleSheet.create({
  item: {
    paddingBottom: 5,
  },
  balanceAmount: {
    color: COLORS.POSITIVE_AMOUNT,
    lineHeight: 24,
    fontSize: 16,
  },
})
