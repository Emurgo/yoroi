import {BigNumber} from 'bignumber.js'
import React from 'react'
import {StyleSheet} from 'react-native'

import {Text} from '../../components'
import {useBalances, useTokenInfo} from '../../hooks'
import {formatTokenWithSymbol} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Amounts} from '../../yoroi-wallets/utils'
import {useStrings} from './strings'

export const BalanceAfterTransaction = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx | null}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})
  const balances = useBalances(wallet)

  if (!yoroiUnsignedTx) {
    return (
      <Text style={styles.info} testID="balanceAfterTxText">
        {strings.balanceAfterLabel}
        {': '}
        {strings.balanceAfterNotAvailable}
      </Text>
    )
  }

  // prettier-ignore
  const balancesAfter = Amounts.diff(
    balances,
    Amounts.sum([
      yoroiUnsignedTx.amounts,
      yoroiUnsignedTx.fee,
    ]),
  )
  const primaryAmountAfter = Amounts.getAmount(balancesAfter, '')

  return (
    <Text style={styles.info} testID="balanceAfterTxText">
      {strings.balanceAfterLabel}
      {': '}
      {formatTokenWithSymbol(new BigNumber(primaryAmountAfter.quantity), tokenInfo)}
    </Text>
  )
}

const styles = StyleSheet.create({
  info: {
    fontSize: 14,
    lineHeight: 22,
  },
})
