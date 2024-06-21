import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon, Tooltip} from '../../../../../components'
import {useStrings} from '../../../common/useStrings'
import {TotalTokensValueContent} from './TotalTokensValueContent'

type Props = {
  amount: Portfolio.Token.Amount
  cardType: 'wallet' | 'dapps'
}

export const TotalTokensValue = ({amount, cardType}: Props) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const isWallet = cardType === 'wallet'
  const title = isWallet ? strings.totalWalletValue : strings.totalDAppValue
  const tooltip = isWallet ? strings.totalWalletValueTooltip : strings.totalDAppsValueTooltip

  return (
    <View style={styles.root}>
      <TotalTokensValueContent
        amount={amount}
        headerCard={
          <Tooltip title={tooltip}>
            <View style={styles.labelContainer}>
              <Text style={[styles.normalText]}>{title}</Text>

              <Icon.InfoCircle />
            </View>
          </Tooltip>
        }
      />
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
      color: color.gray_c600,
    },
    labelContainer: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_xs,
    },
  })

  return {styles} as const
}
