import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, Text, TouchableWithoutFeedback} from 'react-native'
import Animated, {FadeInUp, FadeOut, Layout} from 'react-native-reanimated'

import {YoroiZendeskLink} from '~/features/Receive/common/contants'
import {useStrings} from '~/features/Receive/common/useStrings'
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
        {
          alignSelf: 'stretch',
          borderRadius: 8,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          padding: 16,
          backgroundColor: p.sys_cyan_100,
        },
      ]}
    >
      <Icon.Info size={24} color={p.primary_500} />

      <Text style={[a.body_2_md_regular, {color: p.gray_max}]}>
        {strings.infoAddressLimit}

        <TouchableWithoutFeedback
          onPress={() => {
            Linking.openURL(YoroiZendeskLink)
          }}
        >
          <Text style={{color: p.primary_500, borderWidth: 1}}>
            {strings.yoroiZendesk}
          </Text>
        </TouchableWithoutFeedback>
      </Text>
    </Animated.View>
  )
}
