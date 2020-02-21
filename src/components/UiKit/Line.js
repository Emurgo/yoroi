// @flow

import React from 'react'
import {StyleSheet, View} from 'react-native'
import {COLORS} from '../../styles/config'

const styles = StyleSheet.create({
  container: {
    height: 1,
    opacity: 0.3,
  },
})

type Props = {backgroundColor?: string}

const Line = ({backgroundColor}: Props) => (
  <View
    style={{
      ...styles.container,
      backgroundColor:
        backgroundColor != null ? backgroundColor : COLORS.SECONDARY_TEXT,
    }}
  />
)

export default Line
