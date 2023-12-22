import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useTheme} from '../../../../../theme'
import {useStrings} from '../../../common/useStrings'

export const ShowDisclaimer = () => {
  const {theme} = useTheme()
  const strings = useStrings()

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
    fontSize: 16,
    fontFamily: 'Rubik',
    fontWeight: '500',
    lineHeight: 24,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Rubik',
    lineHeight: 22,
    marginTop: 8,
  },
})
