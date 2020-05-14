// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {Linking, TouchableOpacity, Text, StyleSheet} from 'react-native'

import {COLORS} from '../../styles/config'

import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'
import type {ComponentType} from 'react'

type Props = {
  url: string,
  text: string,
  style?: TextStyleProp,
}

const styles = StyleSheet.create({
  text: {
    color: COLORS.DARK_BLUE,
    textDecorationLine: 'underline',
  },
})

const Link = (compose(
  withHandlers({
    onPress: ({url}: {url: string}) => () => Linking.openURL(url),
  }),
)(({onPress, text, style}) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={[styles.text, style]}>{text}</Text>
  </TouchableOpacity>
)): ComponentType<Props>)

export default Link
