/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Text} from '../../../../../components'
import {type TokenChartTimeInterval, TOKEN_CHART_TIME_INTERVAL} from '../../../common/useGetPortfolioTokenChart'

interface Props {
  timeInterval: TokenChartTimeInterval
  onChange: (timeInterval: TokenChartTimeInterval) => void
  disabled?: boolean
}
export const TokenChartToolbar = ({timeInterval, disabled, onChange}: Props) => {
  const {styles} = useStyles()

  const handleChange = (itv: TokenChartTimeInterval) => {
    if (disabled) return
    onChange(itv)
  }

  return (
    <View style={styles.chartToolbar}>
      {Object.values(TOKEN_CHART_TIME_INTERVAL).map((itv) => (
        <TouchableOpacity
          onPress={() => handleChange(itv)}
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
      ...atoms.justify_between,
      ...atoms.align_center,
      height: 30,
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
