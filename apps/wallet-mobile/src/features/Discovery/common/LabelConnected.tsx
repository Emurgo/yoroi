import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

export const LabelConnected = () => {
  const {styles} = useStyles()
  return (
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>Connected</Text>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, padding, typography} = theme

  const styles = StyleSheet.create({
    labelContainer: {
      backgroundColor: color.secondary[600],
      ...padding['x-s'],
      paddingVertical: 3,
      borderRadius: 999,
    },
    labelText: {
      ...typography['body-3-s-medium'],
      fontWeight: '500',
      color: color['white-static'],
    },
  })

  return {styles} as const
}
