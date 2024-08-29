import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, Spacer} from '../../../../../components'
import {TxHistoryRouteNavigation} from '../../../../../kernel/navigation'
import {useStrings} from '../../../common/useStrings'
import {TradeTokensAsset} from '../../PortfolioDashboard/DashboardTokensList/TradeTokensAsset'

export const TradeTokensBannerBig = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const handleSwap = () => {
    navigation.navigate('swap-start-swap', {screen: 'token-swap'})
  }

  return (
    <View style={styles.root}>
      <LinearGradient style={styles.gradientRoot} colors={colors.gradientColor} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
        <Text style={styles.title}>{strings.portfolioSwapTokensTitle}</Text>

        <Spacer height={13} />

        <Text style={styles.description}>{strings.portfolioSwapTokensDescription}</Text>

        <Spacer height={37} />

        <Button
          mainTheme
          title={strings.startSwapping.toLocaleUpperCase()}
          style={styles.spaceButton}
          textStyles={styles.spaceButtonText}
          onPress={handleSwap}
        />

        <View style={styles.assetBox}>
          <TradeTokensAsset />
        </View>
      </LinearGradient>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
    },
    gradientRoot: {
      ...atoms.p_lg,
      ...atoms.flex_col,
      ...atoms.align_start,
      ...atoms.rounded_sm,
      ...atoms.h_full,
      ...atoms.justify_between,
      ...atoms.relative,
      ...atoms.overflow_hidden,
      backgroundColor: color.bg_color_max,
    },
    spaceButtonText: {
      ...atoms.p_0,
    },
    spaceButton: {
      ...atoms.px_lg,
      minHeight: 40,
    },
    title: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_max,
    },
    assetBox: {
      ...atoms.absolute,
      ...atoms.flex_col,
      ...atoms.justify_center,
      ...atoms.align_center,
      bottom: 6.21,
      right: 1.43,
    },
    description: {
      ...atoms.body_2_md_regular,
      color: color.gray_max,
    },
  })

  const colors = {
    gradientColor: color.bg_gradient_1,
  }

  return {styles, colors} as const
}
