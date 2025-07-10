import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {Space} from '../../../../../ui/Space/Space'
import {useStrings} from '../../../common/useStrings'
import {YoroiLogo} from '../../../illustrations/YoroiLogo'

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
        {strings.loadingLink}
      </Text>
    </View>
  )
}
