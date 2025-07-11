import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, View} from 'react-native'

import NotDelegatedImage from '../../assets/img/testnet/no-transactions-yet.png'
import {Line} from '../../ui/Line/Line'
import {Text} from '../../ui/Text/Text'

export const NotDelegatedInfo = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <View style={[{marginTop: 24, marginHorizontal: 16}]}>
      <View style={[a.flex_1, a.align_center]} testID="notDelegatedInfo">
        <Image source={NotDelegatedImage} />
      </View>

      <Text
        style={[
          {textAlign: 'center', lineHeight: 22},
          a.body_1_lg_regular,
          {marginBottom: 12},
          {color: p.gray_900},
        ]}
      >
        {strings.firstLine}
      </Text>

      <Text
        style={[
          {textAlign: 'center', lineHeight: 22},
          a.body_2_md_regular,
          {marginBottom: 16},
          {color: p.gray_900},
        ]}
      >
        {strings.secondLine}
      </Text>

      <Line />
    </View>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    firstLine: intl.formatMessage(messages.firstLine),
    secondLine: intl.formatMessage(messages.secondLine),
  }
}

const messages = defineMessages({
  firstLine: {
    id: 'components.delegationsummary.notDelegatedInfo.firstLine',
    defaultMessage: '!!!You have not delegated your ADA yet.',
  },
  secondLine: {
    id: 'components.delegationsummary.notDelegatedInfo.secondLine',
    defaultMessage:
      '!!!Go to Staking center to choose which stake pool you want to delegate in. Note, you may delegate only to one stake pool in this Tesnnet.',
  },
})
