import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, Text, TouchableWithoutFeedback} from 'react-native'
import Animated, {FadeInUp, FadeOut, Layout} from 'react-native-reanimated'

import {YoroiHelpLink} from '~/features/Receive/common/contants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

export const ShowAddressLimitInfo = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <Animated.View
      layout={Layout}
      entering={FadeInUp}
      exiting={FadeOut}
      style={[
        a.py_md,
        a.px_lg,
        a.rounded_sm,
        a.gap_sm,
        {
          alignSelf: 'stretch',
          backgroundColor: p.sys_cyan_100,
        },
      ]}
    >
      <Icon.Info size={24} color={p.primary_500} />

      <Text style={[a.body_2_md_regular, {color: p.gray_max}]}>
        {strings.receive.infoAddressLimit}

        <TouchableWithoutFeedback
          onPress={() => {
            Linking.openURL(YoroiHelpLink)
          }}
        >
          <Text style={{color: p.primary_500, borderWidth: 1}}>
            {strings.receive.yoroiFAQ}
          </Text>
        </TouchableWithoutFeedback>
      </Text>
    </Animated.View>
  )
}
