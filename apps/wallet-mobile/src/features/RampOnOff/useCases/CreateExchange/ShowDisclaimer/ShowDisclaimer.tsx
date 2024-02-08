import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useStrings} from '../../../common/useStrings'

export const ShowDisclaimer = () => {
  const {theme} = useTheme()
  const strings = useStrings()
  const styles = useStyles()

  return (
    <LinearGradient
      style={styles.gradient}
      start={{x: 1, y: 1}}
      end={{x: 0, y: 0}}
      colors={theme.color.gradients['blue-green']}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{strings.disclaimer}</Text>

        <Text style={styles.text}>{strings.contentDisclaimer}</Text>
      </View>
    </LinearGradient>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    gradient: {
      opacity: 1,
      borderRadius: 8,
      marginTop: 24,
    },
    title: {
      ...theme.typography['body-1-regular'],
      color: theme.color.gray.max,
      fontWeight: '500',
    },
    text: {
      ...theme.typography['body-2-regular'],
      marginTop: 8,
      color: theme.color.gray.max,
    },
  })

  return styles
}
