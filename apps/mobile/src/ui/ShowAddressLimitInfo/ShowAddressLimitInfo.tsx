import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, Text, TouchableWithoutFeedback} from 'react-native'
import Animated, {FadeInUp, FadeOut, Layout} from 'react-native-reanimated'

import {YoroiZendeskLink} from '../../features/Receive/common/contants'
import {useStrings} from '../../features/Receive/common/useStrings'
import {Icon} from '../Icon'

export const ShowAddressLimitInfo = () => {
  const strings = useStrings()
  const {color} = useTheme()

  return (
    <Animated.View
      layout={Layout}
      entering={FadeInUp}
      exiting={FadeOut}
      style={[styles.smallAddressCard, {backgroundColor: color.sys_cyan_100}]}
    >
      <Icon.Info size={24} color={color.primary_500} />

      <Text style={[styles.text, {color: color.gray_max}]}>
        {strings.infoAddressLimit}

        <TouchableWithoutFeedback
          onPress={() => {
            Linking.openURL(YoroiZendeskLink)
          }}
        >
          <Text style={{color: color.primary_500, borderWidth: 1}}>
            {strings.yoroiZendesk}
          </Text>
        </TouchableWithoutFeedback>
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  smallAddressCard: {
    alignSelf: 'stretch',
    borderRadius: 8,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
  },
  text: {
    ...a.body_2_md_regular,
  },
})
