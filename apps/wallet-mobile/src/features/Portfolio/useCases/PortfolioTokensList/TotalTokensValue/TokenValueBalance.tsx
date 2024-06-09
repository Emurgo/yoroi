import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useCurrencyContext} from '../../../../Settings/Currency'
import {SkeletonPrimaryToken} from './SkeletonPrimaryToken'

type Props = {
  amount: Portfolio.Token.Amount
  isFetching: boolean
  isPrimaryTokenActive: boolean
  rate?: number
}
export const TokenValueBalance = ({amount, isFetching, isPrimaryTokenActive, rate}: Props) => {
  const {currency} = useCurrencyContext()
  const {styles} = useStyles()
  const name = infoExtractName(amount.info)

  const renderBalance = () => {
    if (isFetching || rate === undefined) return <SkeletonPrimaryToken />
    if (!isPrimaryTokenActive)
      return <Text style={[styles.balanceText]}>{amountBreakdown(amount).bn.times(rate).toFormat(2)}</Text>

    return <Text style={[styles.balanceText]}>{amountBreakdown(amount).bn.toFormat(2)}</Text>
  }

  const firstSymbol = isPrimaryTokenActive ? name : currency
  const secondSymbol = isPrimaryTokenActive ? currency : name

  return (
    <View style={styles.balanceBox}>
      {renderBalance()}

      <Text>
        <Text style={styles.adaSymbol}>{firstSymbol}</Text>

        <Text style={[styles.usdSymbol]}>/{secondSymbol}</Text>
      </Text>
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
      ...atoms.heading_1_regular,
      ...atoms.font_semibold,
    },
    adaSymbol: {
      ...atoms.body_1_lg_regular,
      ...atoms.font_semibold,
    },
    usdSymbol: {
      ...atoms.body_1_lg_regular,
      ...atoms.font_semibold,
      color: color.gray_c200,
    },
  })

  return {styles} as const
}
