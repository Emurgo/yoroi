import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Linking, Text, TouchableOpacity} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'

const LEARN_MORE_LINK =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/sections/8582793481231-Governance'

export const LearnMoreLink = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const handleOnPress = () => {
    Linking.openURL(LEARN_MORE_LINK)
  }

  if (LEARN_MORE_LINK.length === 0) return null

  return (
    <TouchableOpacity
      style={[a.flex, a.flex_row, a.align_center, a.justify_center]}
      onPress={handleOnPress}
    >
      <Text style={[{color: p.primary_600}, {textDecorationLine: 'underline'}]}>
        {strings.staking.learnMoreAboutGovernance}
      </Text>
    </TouchableOpacity>
  )
}
