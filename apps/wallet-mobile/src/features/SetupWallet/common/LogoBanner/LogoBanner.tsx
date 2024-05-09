import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../../components/Space/Space'
import {YoroiLogo} from '../../illustrations/YoroiLogo'
import {useStrings} from '../useStrings'

export const LogoBanner = () => {
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
      <YoroiLogo />

      <Text style={styles.title}>{strings.logoTitle}</Text>

      <Space height="sm" />

      <Text style={styles.subtitle}>{strings.logoSubtitle}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      alignItems: 'center',
      backgroundColor: color.gray_cmin,
    },
    title: {
      color: color.primary_c500,
      textAlign: 'center',
      ...atoms.heading_1_medium,
    },
    subtitle: {
      color: color.gray_c900,
      textAlign: 'center',
      ...atoms.body_2_md_regular,
    },
  })

  return {styles} as const
}
