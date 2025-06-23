import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {PreprodNoticeScreenLogo} from '../../common/Illustrations/PreprodNoticeScreenLogo'
import {useStrings} from '../../common/strings'

export const ShowPreprodNoticeScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.container}>
      <PreprodNoticeScreenLogo />

      <Text style={styles.title}>{strings.preprodNoticeTitle}</Text>

      <Text style={styles.text}>{strings.preprodNoticeText}</Text>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: color.bg_color_max,
      ...atoms.p_lg,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: color.gray_900,
      ...atoms.heading_3_medium,
      ...atoms.px_sm,
      textAlign: 'center',
    },
    text: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
      textAlign: 'center',
      maxWidth: 300,
    },
  })
  return {styles}
}
