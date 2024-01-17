import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useStrings} from '../../../common/useStrings'

export const ShowProviderFee = () => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{strings.providerFee}</Text>

      <Text style={styles.text}>{`${2}%`}</Text>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    text: {
      ...theme.typography['body-1-regular'],
      color: theme.color.gray.max,
    },
    label: {
      ...theme.typography['body-1-regular'],
      color: theme.color.gray[600],
    },
  })
  return styles
}
