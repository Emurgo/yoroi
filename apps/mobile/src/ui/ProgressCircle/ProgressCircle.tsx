import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'
import Svg, {Path} from 'react-native-svg'

import {Text} from '../Text/Text'

type ExternalProps = {
  percentage: number
}

export const ProgressCircle = ({percentage}: ExternalProps) => {
  const {color} = useTheme()

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.text, {color: color.text_gray_medium}]}>
        {percentage}%
      </Text>

      <Svg width={56} height={56} viewBox="0 0 36 36" style={styles.chart}>
        <Path
          fill="none"
          stroke={color.gray_200}
          strokeWidth="4"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />

        <Path
          fill="none"
          stroke={color.el_primary_medium}
          strokeWidth="4"
          strokeDasharray={`${percentage}, 100`}
          d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    ...a.align_center,
    ...a.justify_center,
    ...a.relative,
    width: 56,
  },
  text: {
    ...a.body_1_lg_medium,
    ...a.text_center,
    ...a.absolute,
  },
  chart: {
    ...a.absolute,
    top: -28,
    bottom: 0,
    left: 0,
    right: 0,
  },
})
