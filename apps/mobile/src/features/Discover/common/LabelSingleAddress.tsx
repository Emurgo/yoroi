import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'

export const LabelSingleAddress = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  return (
    <View style={[a.px_sm, a.py_2xs, a.rounded_lg, ta.bg_color_min]}>
      <Text style={[a.body_3_sm_medium, ta.text_gray_medium]}>
        {strings.receive.singleAddress}
      </Text>
    </View>
  )
}
