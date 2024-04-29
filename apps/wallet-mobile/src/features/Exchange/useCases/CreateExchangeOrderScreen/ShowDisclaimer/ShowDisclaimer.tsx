import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useStrings} from '../../../common/useStrings'

export const ShowDisclaimer = () => {
  const {color} = useTheme()
  const strings = useStrings()
  const styles = useStyles()

  return (
    <LinearGradient style={styles.gradient} start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={color.bg_gradient_1}>
      <View style={styles.container}>
        <Text style={styles.title}>{strings.disclaimer}</Text>

        <Text style={styles.text}>{strings.contentDisclaimer}</Text>
      </View>
    </LinearGradient>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    gradient: {
      opacity: 1,
      borderRadius: 8,
    },
    title: {
      ...atoms.body_1_lg_regular,
      color: color.gray_cmax,
      fontWeight: '500',
    },
    text: {
      ...atoms.body_2_md_regular,
      marginTop: 8,
      color: color.gray_cmax,
    },
  })

  return styles
}
