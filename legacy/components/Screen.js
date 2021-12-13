// @flow

import type {Node} from 'react'
import React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import type {ViewProps} from 'react-native/Libraries/Components/View/ViewPropTypes'

import {COLORS} from '../styles/config'

export const screenPadding = 20

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

type Props = {|
  children?: Node,
  scroll?: boolean,
  bgColor?: string,
  style?: Object,
  ...ViewProps,
|}

const Screen = ({children, scroll, bgColor, style = {}, ...restProps}: Props) => {
  const Container = scroll === true ? ScrollView : View

  return (
    <Container
      {...restProps}
      style={[styles.container, {backgroundColor: bgColor != null ? bgColor : COLORS.WHITE}, style]}
    >
      {children}
    </Container>
  )
}

export default Screen
