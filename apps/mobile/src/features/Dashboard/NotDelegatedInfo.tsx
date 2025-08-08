import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, View} from 'react-native'

import NotDelegatedImage from '~/assets/img/testnet/no-transactions-yet.png'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Line} from '~/ui/Line/Line'
import {Text} from '~/ui/Text/Text'

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
        {strings.dashboard.firstLine}
      </Text>

      <Text
        style={[
          {textAlign: 'center', lineHeight: 22},
          a.body_2_md_regular,
          {marginBottom: 16},
          {color: p.gray_900},
        ]}
      >
        {strings.dashboard.secondLine}
      </Text>

      <Line />
    </View>
  )
}
