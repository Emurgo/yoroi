import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'
import Svg, {Path} from 'react-native-svg'

import {Text} from './Text'

type ExternalProps = {
  percentage: number
}

export const ProgressCircle = ({percentage}: ExternalProps) => {
  const styles = useStyles()
  const {color} = useTheme()

  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>{percentage}%</Text>

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

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    wrapper: {
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.relative,
      width: 56,
    },
    text: {
      ...atoms.body_1_lg_medium,
      ...atoms.text_center,
      ...atoms.absolute,
      color: color.text_gray_medium,
    },
    chart: {
      ...atoms.absolute,
      top: -28,
      bottom: 0,
      left: 0,
      right: 0,
    },
  })

  return styles
}
