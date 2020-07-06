// @flow

import React from 'react'
import type {Node} from 'react'
import {StyleSheet, View, ScrollView} from 'react-native'
import {COLORS} from '../styles/config'

export const screenPadding = 20

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

type Props = {
  children?: Node,
  scroll?: boolean,
  bgColor?: string,
  style?: Object,
}

const Screen = ({
  children,
  scroll,
  bgColor,
  style = {},
  ...restProps
}: Props) => {
  const Container = scroll === true ? ScrollView : View

  return (
    <Container
      {...restProps}
      style={[
        styles.container,
        {backgroundColor: bgColor != null ? bgColor : COLORS.WHITE},
        style,
      ]}
    >
      {children}
    </Container>
  )
}

export default Screen
