import React from 'react'
import {StyleSheet, View} from 'react-native'

import {COLORS} from '../../theme'
import {Icon} from '../Icon'

export const Placeholder = () => (
  <View style={[styles.icon, styles.placeholder]}>
    <Icon.Tokens color={COLORS.TEXT_INPUT} size={35} />
  </View>
)

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  icon: {
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
