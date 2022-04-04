import React from 'react'
import {StyleSheet, View} from 'react-native'
import Svg, {Path} from 'react-native-svg'

import {COLORS} from '../theme'
import {Text} from './Text'

type ExternalProps = {
  percentage: number
}

export const ProgressCircle = ({percentage}: ExternalProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.textWrapper}>{percentage}%</Text>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Svg viewBox="0 0 36 36" height={undefined as any} width={undefined as any} style={styles.chart}>
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

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  textWrapper: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 'bold',
    color: COLORS.LIGHT_GRAY_TEXT,
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
