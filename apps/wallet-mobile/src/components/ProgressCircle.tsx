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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const height = undefined as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const width = undefined as any
  return (
    <View style={styles.wrapper}>
      <Text style={styles.textWrapper}>{percentage}%</Text>

      <Svg viewBox="0 0 36 36" height={height} width={width} style={styles.chart}>
        <Path
          fill="none"
          stroke="#B7C3ED"
          strokeWidth="4"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />

        <Path
          fill="none"
          stroke="#3154CB"
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
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 100,
    },
    textWrapper: {
      ...typography['heading-4-medium'],
      color: color.gray[700],
      textAlign: 'center',
    },
    chart: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      height: '100%',
    },
  })

  return styles
}
