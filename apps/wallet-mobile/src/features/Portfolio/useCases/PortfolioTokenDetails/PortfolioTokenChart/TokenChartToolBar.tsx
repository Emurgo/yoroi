/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Text} from '../../../../../components/Text'
import {type TokenChartInterval, TOKEN_CHART_INTERVAL} from '../../../common/hooks/useGetPortfolioTokenChart'

interface Props {
  timeInterval: TokenChartInterval
  onChange: (timeInterval: TokenChartInterval) => void
  disabled?: boolean
}
export const TokenChartToolbar = ({timeInterval, disabled, onChange}: Props) => {
  const {styles} = useStyles()

  const handleChange = (itv: TokenChartInterval) => {
    if (disabled) return
    onChange(itv)
  }

  return (
    <View style={styles.chartToolbar}>
      {Object.values(TOKEN_CHART_INTERVAL).map((itv) => (
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
      color: color.gray_600,
      textTransform: 'uppercase',
    },
    chartToolbarItemActive: {
      backgroundColor: color.primary_500,
    },
    chartToolbarItemTextActive: {
      color: color.gray_min,
    },
  })

  return {styles} as const
}
