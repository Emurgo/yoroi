import {BigNumber} from 'bignumber.js'
import React from 'react'
import {StyleSheet} from 'react-native'

import {Text} from '../../components'
import {useTokenInfo} from '../../hooks'
import {formatTokenWithSymbol} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Amounts} from '../../yoroi-wallets/utils'
import {useStrings} from './strings'

export const Fee = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx | null}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})

  if (yoroiUnsignedTx == null) {
    return (
      <Text style={styles.info} testID="feesText">
        {strings.feeLabel}
        {': '}
        {strings.feeNotAvailable}
      </Text>
    )
  }

  const primaryAmount = Amounts.getAmount(yoroiUnsignedTx.fee, '')

  return (
    <Text style={styles.info} testID="feesText">
      {strings.feeLabel}
      {': '}
      {formatTokenWithSymbol(new BigNumber(primaryAmount.quantity), tokenInfo)}
    </Text>
  )
}

const styles = StyleSheet.create({
  info: {
    fontSize: 14,
    lineHeight: 22,
  },
})
