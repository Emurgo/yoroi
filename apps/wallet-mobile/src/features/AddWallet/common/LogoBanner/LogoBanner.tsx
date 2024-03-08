import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../../components/Space/Space'
import YoroiLogo from '../../illustrations/YoroiLogo'
import {useStrings} from '../useStrings'

export const LogoBanner = () => {
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <View style={styles.logoArea}>
      <YoroiLogo />

      <Text style={styles.logoName}>{strings.logoTitle}</Text>

      <Space height="s" />

      <Text style={styles.descriptionText}>{strings.logoSubtitle}</Text>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    logoArea: {
      alignItems: 'center',
    },
    logoName: {
      color: theme.color.primary[500],
      textAlign: 'center',
      ...theme.typography['heading-1-medium'],
    },
    descriptionText: {
      color: theme.color.gray[900],
      textAlign: 'center',
      ...theme.typography['body-2-m-regular'],
    },
  })

  return {styles} as const
}
