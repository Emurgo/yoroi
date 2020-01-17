// @flow
import React, {Component} from 'react'
import {View} from 'react-native'
import Svg, {Path} from 'react-native-svg'
import Text from './Text'
import styles from './styles/ProgressCircle'

type Props = {|
  +percentage: number,
|};

class ProgressCircle extends Component<Props> {

  render() {
    const {percentage} = this.props
    return (
      <View style={styles.wrapper}>
        <Text style={styles.textWrapper}>
          {percentage}%
        </Text>
        <Svg viewBox="0 0 36 36" style={styles.chart}>
          <Path
            style={styles.circle}
            fill="none"
            stroke="#B7C3ED"
            strokeWidth="3"
            d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <Path
            style={styles.circle}
            fill="none"
            stroke="#3154CB"
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </Svg>
      </View>
    )
  }

}

export default ProgressCircle
