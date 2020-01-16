// @flow
import React, {Component} from 'react'
import Svg, {Path} from 'react-native-svg'

import styles from './styles/ProgressCircle'

type Props = {|
  percentage: number,
|};

// TODO
class ProgressCircle extends Component<Props> {
  static defaultProps = {
    text: null,
  };

  render() {
    const {percentage} = this.props
    return (
      <div className={styles.wrapper}>
        <div className={styles.textWrapper}>
          {percentage}%
        </div>
        <Svg viewBox="0 0 36 36" style={styles.chart}>
          <Path
            style={`${styles.circle} ${styles.baseCircle}`}
            d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <Path
            style={styles.circle}
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </Svg>
      </div>
    )
  }

}

export default ProgressCircle
