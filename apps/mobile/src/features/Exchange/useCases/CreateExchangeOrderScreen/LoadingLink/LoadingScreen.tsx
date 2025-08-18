import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {YoroiLogo} from '~/features/Exchange/illustrations/YoroiLogo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

export const LoadingLinkScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <View style={[a.flex_1, a.align_center, a.justify_center]}>
      <YoroiLogo />

      <Space.Height.xl />

      <Text
        style={[
          a.heading_3_medium,
          a.text_center,
          ta.text_gray_max,
          {maxWidth: 340},
        ]}
      >
        {strings.exchange.loadingLink}
      </Text>
    </View>
  )
}
