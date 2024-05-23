/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon, Text} from '../../../../../components'
import {Tooltip} from '../../../../../components/Tooltip'
import {PnlTag} from '../../../common/PnlTag/PnlTag'

interface Props {
  changePercent?: number
  changeValue?: number
  value?: number
}

export const TokenPerformance = ({changePercent = 0, changeValue = 0, value = 0}: Props) => {
  const {styles} = useStyles()

  const variant = Number(changePercent) >= 0 ? 'success' : 'danger'

  return (
    <View style={styles.root}>
      <View style={styles.tokenChangeWrapper}>
        <PnlTag withIcon variant={variant}>
          {changePercent.toFixed(2)}%
        </PnlTag>

        <PnlTag variant={variant}>{`${changeValue.toFixed(1)} USD`}</PnlTag>

        <Tooltip numberOfLine={3} title={`Token price change \nin 24 hours`}>
          <Icon.InfoCircle />
        </Tooltip>
      </View>

      <View style={styles.tokenWrapper}>
        <Text style={styles.tokenPrice}>{value.toFixed(0)}</Text>

        <Text style={styles.tokenPriceSymbol}>USD</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    tokenWrapper: {
      ...atoms.flex_row,
      ...atoms.gap_2xs,
      ...atoms.align_baseline,
    },

    tokenChangeWrapper: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      gap: 2,
    },
    tokenPrice: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_cmax,
    },
    tokenPriceSymbol: {
      ...atoms.body_3_sm_regular,
      color: color.gray_cmax,
    },
  })

  return {styles} as const
}
