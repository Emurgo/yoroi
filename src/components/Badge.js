/**
 * @flow
 */

import React, {Component} from 'react'
import {StyleSheet, View, Text} from 'react-native'
import stylesConfig from '../styles/config'

const styles = StyleSheet.create({
  container: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
  },
  text: {
    fontFamily: stylesConfig.defaultFont,
  }
})

type Props = {text: string, color?: string, backgroundColor?: string}

class Badge extends Component<Props> {
  render() {
    const {text, color, backgroundColor} = this.props

    return (
      <View
        style={{
          ...styles.container,
          backgroundColor: backgroundColor || stylesConfig.primaryColor,
        }}
      >
        <Text
          style={{
            ...styles.text,
            color: color || stylesConfig.primaryTextColor,
          }}
        >{text}</Text>
      </View>
    )
  }
}

export default Badge
