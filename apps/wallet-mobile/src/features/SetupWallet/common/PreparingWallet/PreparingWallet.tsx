import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '../useStrings'

export const PreparingWallet = () => {
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{strings.preparingWallet}</Text>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: theme.color.primary[500],
      textAlign: 'center',
      ...theme.typography['heading-2-medium'],
    },
  })

  return {styles} as const
}
