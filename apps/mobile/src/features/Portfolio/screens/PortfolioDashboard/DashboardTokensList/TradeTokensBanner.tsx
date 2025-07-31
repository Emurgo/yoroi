import {atoms as a, useTheme} from '@yoroi/theme'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useNavigateTo} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {Button} from '~/ui/Button/Button'
import {TradeTokensAsset} from './TradeTokensAsset'

export const TradeTokensBanner = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const navigationTo = useNavigateTo()

  const handleSwap = () => {
    navigationTo.swap()
  }

  return (
    <View style={[a.flex_1, a.h_full]}>
      <LinearGradient
        style={[
          a.p_lg,
          a.flex_col,
          a.align_start,
          a.rounded_sm,
          a.h_full,
          a.justify_between,
          a.relative,
          a.overflow_hidden,
          {backgroundColor: p.bg_color_max},
        ]}
        colors={p.bg_gradient_1}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <Text
          style={[a.body_1_lg_medium, a.font_semibold, {color: p.gray_max}]}
        >
          {strings.tradeTokens}
        </Text>

        <Button title={strings.swap} onPress={handleSwap} />

        <View
          style={[
            a.absolute,
            a.flex_col,
            a.justify_center,
            a.align_center,
            {right: -17.09, top: 37.61},
          ]}
        >
          <TradeTokensAsset />
        </View>
      </LinearGradient>
    </View>
  )
}
