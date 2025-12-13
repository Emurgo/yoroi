import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useNavigateTo} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'

import {TradeTokensAsset} from '../../PortfolioDashboard/DashboardTokensList/TradeTokensAsset'

export const TradeTokensBannerBig = () => {
  const {palette: p, atoms: ta} = useTheme()
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  const handleSwap = () => {
    navigateTo.resetTabAndSwapWithRemoteConfig()
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
          ta.bg_color_max,
        ]}
        colors={p.bg_gradient_1}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <Text
          style={[a.body_1_lg_medium, a.font_semibold, {color: p.gray_max}]}
        >
          {strings.portfolio.portfolioSwapTokensTitle}
        </Text>

        <Space.Height.sm />

        <Text style={[a.body_2_md_regular, {color: p.gray_max}]}>
          {strings.portfolio.portfolioSwapTokensDescription}
        </Text>

        <Space.Height.xl />

        <Button title={strings.portfolio.startSwapping} onPress={handleSwap} />

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
