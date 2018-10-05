// @flow

import React, {Component} from 'react'
import type {Node} from 'react'
import {StyleSheet, Text} from 'react-native'
import stylesConfig from '../styles/config'

const styles = StyleSheet.create({
  text: {
    fontFamily: stylesConfig.defaultFont,
    color: '#000',
  },
})

type Props = {children: Node}

class CustomText extends Component<Props> {
  render() {
    const {children} = this.props

    return (
      <Text style={styles.text}>{children}</Text>
    )
  }
}

export default CustomText
