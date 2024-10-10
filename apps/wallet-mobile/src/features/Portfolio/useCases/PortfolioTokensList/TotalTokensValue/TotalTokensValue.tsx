import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '../../../common/hooks/useStrings'
import {PortfolioListTab, usePortfolio} from '../../../common/PortfolioProvider'
import {TotalTokensValueContent} from './TotalTokensValueContent'

type Props = {
  amount: Portfolio.Token.Amount
}

export const TotalTokensValue = ({amount}: Props) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {listTab} = usePortfolio()
  const title = listTab === PortfolioListTab.Wallet ? strings.totalWalletValue : strings.totalDAppValue

  return (
    <View style={styles.root}>
      <TotalTokensValueContent amount={amount} headerCard={<Text style={[styles.normalText]}>{title}</Text>} />
    </View>
  )
}
const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.py_lg,
    },
    normalText: {
      ...atoms.body_3_sm_regular,
      color: color.gray_600,
    },
  })

  return {styles} as const
}
