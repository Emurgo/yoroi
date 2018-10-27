// @flow

import React from 'react'
import type {Node} from 'react'
import {StyleSheet, View, ScrollView} from 'react-native'
import {COLORS} from '../styles/config'

export const screenPadding = 20

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: screenPadding,
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
  const Container = scroll ? ScrollView : View

  return (
    <Container
      style={[
        styles.container,
        {backgroundColor: bgColor || COLORS.WHITE},
        style,
      ]}
      {...restProps}
    >
      {children}
    </Container>
  )
}

export default Screen
