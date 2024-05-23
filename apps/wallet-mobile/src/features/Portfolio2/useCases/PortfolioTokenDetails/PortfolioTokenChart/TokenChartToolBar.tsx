/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Text} from '../../../../../components'
import {type TokenChartTimeInterval, TOKEN_CHART_TIME_INTERVAL} from '../../../common/useGetPortfolioTokenChart'

interface Props {
  timeInterval: TokenChartTimeInterval
  onChange: (timeInterval: TokenChartTimeInterval) => void
}
export const TokenChartToolbar = ({timeInterval, onChange}: Props) => {
  const {styles} = useStyles()

  return (
    <View style={styles.chartToolbar}>
      {Object.values(TOKEN_CHART_TIME_INTERVAL).map((itv) => (
        <TouchableOpacity
          onPress={() => onChange(itv)}
          style={[itv === timeInterval ? styles.chartToolbarItemActive : {}, styles.chartToolbarItem]}
          key={itv}
        >
          <Text style={[styles.chartToolbarItemText, itv === timeInterval ? styles.chartToolbarItemTextActive : {}]}>
            {itv}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    chartToolbar: {
      ...atoms.flex_row,
      ...atoms.flex_1,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    chartToolbarItem: {
      ...atoms.rounded_sm,
      padding: 6,
    },
    chartToolbarItemText: {
      ...atoms.body_3_sm_medium,
      ...atoms.font_semibold,
      color: color.gray_c600,
      textTransform: 'uppercase',
    },
    chartToolbarItemActive: {
      backgroundColor: color.primary_c500,
    },
    chartToolbarItemTextActive: {
      color: color.gray_cmin,
    },
  })

  return {styles} as const
}
