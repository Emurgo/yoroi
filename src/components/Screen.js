// @flow

import React from 'react'
import type {Node} from 'react'
import {StyleSheet, View, ScrollView} from 'react-native'
import {COLORS} from '../styles/config'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
})

type Props = {children?: Node, scroll?: boolean, bgColor?: string}

const Screen = ({children, scroll, bgColor}: Props) => {
  const Container = scroll ? ScrollView : View

  return (
    <Container
      style={[
        styles.container,
        {backgroundColor: bgColor || COLORS.WHITE},
      ]}
    >
      {children}
    </Container>
  )
}

export default Screen
