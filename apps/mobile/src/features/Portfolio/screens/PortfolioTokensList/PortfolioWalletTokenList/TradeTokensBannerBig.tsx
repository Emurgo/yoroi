import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {useStrings} from '~/features/ReviewTx/common/hooks/useStrings'
import {TxHistoryRouteNavigation} from '~/kernel/navigation'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {TradeTokensAsset} from '../PortfolioDashboard/DashboardTokensList/TradeTokensAsset'

export const TradeTokensBannerBig = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()

  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const handleSwap = () => {
    navigation.navigate('swap-main')
  }

  return (
    <View style={[a.flex_1]}>
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
          {strings.portfolioSwapTokensTitle}
        </Text>

        <Space.Height.sm />

        <Text style={[a.body_2_md_regular, {color: p.gray_max}]}>
          {strings.portfolioSwapTokensDescription}
        </Text>

        <Space.Height.xl />

        <Button title={strings.startSwapping} onPress={handleSwap} />

        <View
          style={[
            a.absolute,
            a.flex_col,
            a.justify_center,
            a.align_center,
            {bottom: 6.21, right: 1.43},
          ]}
        >
          <TradeTokensAsset />
        </View>
      </LinearGradient>
    </View>
  )
}
