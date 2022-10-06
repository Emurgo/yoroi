import {BigNumber} from 'bignumber.js'
import React from 'react'
import {StyleSheet} from 'react-native'

import {Text} from '../../components'
import {useTokenInfo} from '../../hooks'
import {formatTokenWithSymbol} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {Quantity} from '../../yoroi-wallets/types'
import {useStrings} from './strings'

export const BalanceAfterTransaction = ({balanceAfter}: {balanceAfter: Quantity | null}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})

  const value =
    balanceAfter !== null
      ? formatTokenWithSymbol(new BigNumber(balanceAfter), tokenInfo)
      : strings.balanceAfterNotAvailable

  return (
    <Text style={styles.info} testID="balanceAfterTxText">
      {strings.balanceAfterLabel}
      {': '}
      {value}
    </Text>
  )
}

const styles = StyleSheet.create({
  info: {
    fontSize: 14,
    lineHeight: 22,
  },
})
