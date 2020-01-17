// @flow

import React, {Component} from 'react'
import type {Node} from 'react'
import {View} from 'react-native'

import Text from './Text'
import styles from './styles/Card.style'

type Props = {|
  title?: string,
  children: Node,
|};

class Card extends Component<Props> {

  static defaultProps = {
    title: undefined,
  };

  render() {
    const {title, children} = this.props
    return (
      <View style={styles.wrapper}>
        {title !== undefined &&
          <Text className={styles.title}>
            {title}
          </Text>
        }
        {/* <View style={styles.inner}>
          {children}
        </View> */}
      </View>
    )
  }
}

export default Card
