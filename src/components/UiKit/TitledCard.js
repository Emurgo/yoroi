// @flow

import React, {Component} from 'react'
import type {Node} from 'react'
import {View} from 'react-native'

import Text from './Text'
import styles from './styles/TitledCard.style'

type Props = {|
  title?: string,
  children: Node,
|};

class TitledCard extends Component<Props> {

  render() {
    const {title, children} = this.props
    return (
      <View style={styles.wrapper}>
        {title !== undefined &&
          <Text style={styles.title}>
            {title}
          </Text>
        }
        <View style={styles.inner}>
          {children}
        </View>
      </View>
    )
  }
}

export default TitledCard
