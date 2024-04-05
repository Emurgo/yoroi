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

      <Space height="s" />

      <Text style={styles.subtitle}>{strings.logoSubtitle}</Text>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      alignItems: 'center',
    },
    title: {
      color: theme.color.primary[500],
      textAlign: 'center',
      ...theme.typography['heading-1-medium'],
    },
    subtitle: {
      color: theme.color.gray[900],
      textAlign: 'center',
      ...theme.typography['body-2-m-regular'],
    },
  })

  return {styles} as const
}
