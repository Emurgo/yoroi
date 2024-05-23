/* eslint-disable react-native/no-raw-text */
import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useGetPortfolioTokenInfo} from '../../../common/useGetPortfolioTokenInfo'
import {PortfolioTokenDetailBalanceSkeleton} from './PortfolioTokenDetailBalanceSkeleton'

export const PortfolioTokenBalance = () => {
  const {styles} = useStyles()
  const {data, isFetching} = useGetPortfolioTokenInfo('ADA')

  if (isFetching || !data) return <PortfolioTokenDetailBalanceSkeleton />
  return (
    <View>
      <View style={styles.tokenWrapper}>
        <Text style={styles.tokenLabel}>{amountFormatter({dropTraillingZeros: true})(data.amount)}</Text>

        <Text style={styles.symbol}>ADA</Text>
      </View>

      <PairedBalance textStyle={styles.usdLabel} ignorePrivacy amount={data.amount} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    tokenWrapper: {
      ...atoms.flex_row,
      ...atoms.gap_2xs,
      ...atoms.align_baseline,
    },
    tokenLabel: {
      ...atoms.heading_1_regular,
      ...atoms.font_semibold,
    },
    symbol: {
      ...atoms.body_1_lg_regular,
      ...atoms.font_semibold,
    },
    usdLabel: {
      ...atoms.body_2_md_regular,
      color: color.gray_c600,
    },
  })

  return {styles} as const
}
