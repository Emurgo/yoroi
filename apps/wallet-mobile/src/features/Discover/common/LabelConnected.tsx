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
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    labelContainer: {
      backgroundColor: color.secondary_c600,
      ...atoms.px_sm,
      paddingVertical: 3,
      borderRadius: 999,
    },
    labelText: {
      ...atoms.body_3_sm_medium,
      fontWeight: '500',
      color: color.white_static,
    },
  })

  return {styles} as const
}
