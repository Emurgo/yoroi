import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../../../components/Space/Space'
import {useStrings} from '../../../common/useStrings'
import {YoroiLogo} from '../../../illustrations/YoroiLogo'

export const LoadingLinkScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  return (
    <View style={styles.root}>
      <YoroiLogo />

      <Space height="xl" />

      <Text style={styles.text}>{strings.loadingLink}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    text: {
      ...atoms.heading_3_medium,
      ...atoms.text_center,
      color: color.text_gray_max,
      maxWidth: 340,
    },
  })

  return {styles} as const
}
