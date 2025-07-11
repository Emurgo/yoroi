import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '../../features/SetupWallet/common/useStrings'
import {Space} from '../Space/Space'
import {YoroiLogo} from '../YoroiLogo/YoroiLogo'

export const LogoBanner = () => {
  const strings = useStrings()
  const {color} = useTheme()

  return (
    <View style={[styles.root, {backgroundColor: color.bg_color_max}]}>
      <YoroiLogo />

      <Text style={[styles.title, {color: color.primary_500}]}>
        {strings.logoTitle}
      </Text>

      <Space height="sm" />

      <Text style={[styles.subtitle, {color: color.gray_900}]}>
        {strings.logoSubtitle}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    ...a.heading_1_medium,
  },
  subtitle: {
    textAlign: 'center',
    ...a.body_2_md_regular,
  },
})
