import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useCurrencyPairing} from '../../../../Settings/Currency'
import {usePrivacyMode} from '../../../../Settings/PrivacyMode/PrivacyMode'
import {SkeletonPrimaryToken} from './SkeletonPrimaryToken'

type Props = {
  amount: Portfolio.Token.Amount
  isFetching: boolean
  isPrimaryTokenActive: boolean
  rate?: number
}
export const TokenValueBalance = ({amount, isFetching, isPrimaryTokenActive, rate}: Props) => {
  const {currency, config} = useCurrencyPairing()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {styles} = useStyles()
  const name = infoExtractName(amount.info)

  return (
    <View style={styles.balanceBox}>
      {isFetching || rate === undefined ? (
        <SkeletonPrimaryToken />
      ) : (
        <Text style={[styles.balanceText]}>
          {isPrivacyActive
            ? privacyPlaceholder
            : isPrimaryTokenActive
            ? amountBreakdown(amount).bn.toFormat(2)
            : amountBreakdown(amount).bn.times(rate).toFormat(config.decimals)}
        </Text>
      )}

      <Text style={styles.symbol}>{isPrimaryTokenActive ? name : currency}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    balanceBox: {
      ...atoms.flex_row,
      ...atoms.gap_2xs,
      ...atoms.align_baseline,
    },
    balanceText: {
      ...atoms.heading_1_medium,
      ...atoms.font_semibold,
      color: color.text_gray_medium,
    },
    symbol: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.text_gray_medium,
    },
  })

  return {styles} as const
}
