import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer} from '../../../../../components'
import {Text} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {formatTokenWithText} from '../../../../../legacy/format'
import {useUnsafeParams} from '../../../../../navigation'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {Amounts} from '../../../../../yoroi-wallets/utils'
import {useNavigateTo, useStrings} from '../../common'
import {Routes} from '../../common/navigation'

export const ConfirmTxScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const params = useUnsafeParams<Routes['confirm-tx']>()
  const navigateTo = useNavigateTo()

  const titles = {
    abstain: strings.actionAbstainTitle,
    'no-confidence': strings.actionNoConfidenceTitle,
    delegate: strings.actionDelegateToADRepTitle,
  }

  const descriptions = {
    abstain: strings.actionAbstainDescription,
    'no-confidence': strings.actionNoConfidenceDescription,
    delegate: strings.actionDelegateToADRepDescription,
  }

  const title = titles[params.vote.kind]
  const description = descriptions[params.vote.kind]
  const fee = params.unsignedTx.fee
  const feeAmount = Amounts.getAmount(fee, wallet.primaryToken.identifier)
  const feeText = formatTokenWithText(feeAmount.quantity, wallet.primaryToken)

  const onSubmit = () => {
    // TODO: save tx
    // TODO: Submit tx
    navigateTo.txSuccess()
  }

  return (
    <View style={styles.root}>
      <Text style={styles.primaryText}>{title}</Text>

      <Spacer height={4} />

      <Text style={styles.secondaryText}>{description}</Text>

      <Spacer height={24} />

      <View style={styles.totalsArea}>
        <View style={styles.row}>
          <Text style={styles.total}>{strings.total}</Text>

          <Text style={styles.totalValue}>{feeText}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.total} />

          <PairedBalance amount={feeAmount} textStyle={styles.fiatValue} />
        </View>
      </View>

      <Spacer height={24} />

      <Text style={styles.secondaryText}>{strings.transactionDetails}</Text>

      <Spacer fill />

      <Button title={strings.confirm} shelleyTheme onPress={onSubmit} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 18,
    flex: 1,
    justifyContent: 'space-between',
  },
  primaryText: {
    fontFamily: 'Rubik-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#242838',
    fontWeight: '500',
  },
  secondaryText: {
    fontFamily: 'Rubik-Regular',
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7384',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalsArea: {
    backgroundColor: '#3154cb',
    padding: 16,
    borderRadius: 8,
  },
  total: {
    fontFamily: 'Rubik-Regular',
    fontSize: 18,
    lineHeight: 26,
    color: '#ffffff',
  },
  totalValue: {
    fontFamily: 'Rubik-Medium',
    fontSize: 18,
    lineHeight: 26,
    color: '#ffffff',
    fontWeight: '500',
  },
  fiatValue: {
    fontFamily: 'Rubik-Regular',
    fontSize: 14,
    lineHeight: 22,
    color: '#ffffff',
    opacity: 0.5,
  },
})
