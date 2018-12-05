// @flow

import React from 'react'
import type {Node} from 'react'
import {StyleSheet, View, ScrollView} from 'react-native'
import {COLORS} from '../styles/config'

export const screenPadding = 20

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  if (scroll) {
    return (
      <ScrollView
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.container]}
        style={[{backgroundColor: bgColor || COLORS.WHITE}, style]}
        {...restProps}
      >
        {children}
      </ScrollView>
    )
  } else {
    return (
      <View
        style={[
          styles.container,
          {backgroundColor: bgColor || COLORS.WHITE},
          style,
        ]}
        {...restProps}
      >
        {children}
      </View>
    )
  }
}

export default Screen
