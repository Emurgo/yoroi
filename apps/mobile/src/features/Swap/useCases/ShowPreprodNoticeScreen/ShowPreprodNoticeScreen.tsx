import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {PreprodNoticeScreenLogo} from '../../../ui/PreprodNoticeScreenLogo/PreprodNoticeScreenLogo'
import {useStrings} from '../../common/strings'

export const ShowPreprodNoticeScreen = () => {
  const strings = useStrings()
  const {color} = useTheme()

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[styles.container, {backgroundColor: color.bg_color_max}]}
    >
      <PreprodNoticeScreenLogo />

      <Text style={[styles.title, {color: color.gray_900}]}>
        {strings.preprodNoticeTitle}
      </Text>

      <Text style={[styles.text, {color: color.text_gray_medium}]}>
        {strings.preprodNoticeText}
      </Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    ...a.p_lg,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...a.heading_3_medium,
    ...a.px_sm,
    textAlign: 'center',
  },
  text: {
    ...a.body_1_lg_regular,
    textAlign: 'center',
    maxWidth: 300,
  },
})
