import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '../../features/SetupWallet/common/useStrings'
import {Space} from '../Space/Space'

export const LogoBanner = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <View style={[a.align_center, {backgroundColor: p.bg_color_max}]}>
      <Text style={[{color: p.primary_500}, a.text_center, a.heading_1_medium]}>
        {strings.logoTitle}
      </Text>

      <Space.Height.sm />

      <Text style={[a.text_center, a.body_2_md_regular, {color: p.gray_900}]}>
        {strings.logoSubtitle}
      </Text>
    </View>
  )
}
