// @flow
import React from 'react'
import {View} from 'react-native'
import Svg, {Path} from 'react-native-svg'
import Text from './Text'
import styles from './styles/ProgressCircle.style'

type ExternalProps = {|
  +percentage: number,
|};

const ProgressCircle = ({
  percentage,
}: ExternalProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.textWrapper}>
      {percentage}%
    </Text>
    <Svg viewBox="0 0 36 36" style={styles.chart}>
      <Path
        style={styles.circle}
        fill="none"
        stroke="#B7C3ED"
        strokeWidth="4"
        d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <Path
        style={styles.circle}
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

export default ProgressCircle
