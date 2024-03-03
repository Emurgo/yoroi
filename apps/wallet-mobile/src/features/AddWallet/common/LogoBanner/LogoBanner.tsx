import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../components'
import YoroiLogo from '../../illustrations/YoroiLogo'

export const LogoBanner = () => {
  const {styles} = useStyles()

  return (
    <View style={styles.logoArea}>
      <YoroiLogo />

      <Text style={styles.logoName}>Yoroi</Text>

      <Spacer height={8} />

      <Text style={styles.descriptionText}>Light wallet for Cardano assets</Text>
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
      fontFamily: 'Rubik',
      fontWeight: '500',
      fontSize: 30,
      lineHeight: 38,
      textAlign: 'center',
    },
    descriptionText: {
      color: theme.color.gray[900],
      fontFamily: 'Rubik',
      fontWeight: '400',
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
    },
  })

  return {styles} as const
}
