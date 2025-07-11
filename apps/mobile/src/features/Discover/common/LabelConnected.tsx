import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from './useStrings'

export const LabelConnected = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  return (
    <View
      style={[
        a.px_sm,
        {paddingVertical: 3, borderRadius: 999},
        {backgroundColor: p.secondary_600},
      ]}
    >
      <Text
        style={[a.body_3_sm_medium, {fontWeight: '500'}, {color: p.gray_min}]}
      >
        {strings.connected}
      </Text>
    </View>
  )
}
