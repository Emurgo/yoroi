import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStrings} from '~/features/Swap/common/strings'
import {PreprodNoticeScreenLogo} from '~/ui/PreprodNoticeScreenLogo/PreprodNoticeScreenLogo'

export const ShowPreprodNoticeScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[
        a.p_lg,
        a.flex_1,
        a.align_center,
        a.justify_center,
        {backgroundColor: p.bg_color_max},
      ]}
    >
      <PreprodNoticeScreenLogo />

      <Text
        style={[
          a.heading_3_medium,
          a.px_sm,
          a.text_center,
          {color: p.gray_900},
        ]}
      >
        {strings.preprodNoticeTitle}
      </Text>

      <Text
        style={[
          a.body_1_lg_regular,
          a.text_center,
          {maxWidth: 300, color: p.text_gray_medium},
        ]}
      >
        {strings.preprodNoticeText}
      </Text>
    </SafeAreaView>
  )
}
