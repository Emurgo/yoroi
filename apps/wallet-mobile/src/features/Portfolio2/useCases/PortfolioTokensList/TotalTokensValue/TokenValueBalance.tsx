import {amountFormatter, infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useCurrencyContext} from '../../../../../features/Settings/Currency'
import {SkeletonPrimaryToken} from './SkeletonPrimaryToken'

type Props = {
  amount: Portfolio.Token.Amount
  isFetching: boolean
  isPrimaryPair: boolean
}
export const TokenValueBalance = ({amount, isFetching, isPrimaryPair}: Props) => {
  const {currency} = useCurrencyContext()
  const {styles} = useStyles()
  const name = infoExtractName(amount.info)

  const renderBalance = () => {
    if (isFetching) return <SkeletonPrimaryToken />
    if (isPrimaryPair) return <PairedBalance amount={amount} textStyle={styles.balanceText} />

    return <Text style={[styles.balanceText]}>{amountFormatter()(amount)}</Text>
  }

  const firstSymbol = isPrimaryPair ? currency : name
  const secondSymbol = isPrimaryPair ? name : currency

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
      ...atoms.align_center,
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
