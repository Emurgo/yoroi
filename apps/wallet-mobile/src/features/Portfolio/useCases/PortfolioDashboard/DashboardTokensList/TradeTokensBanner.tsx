import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button} from '../../../../../components'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {useStrings} from '../../../common/useStrings'
import {TradeTokensAsset} from './TradeTokensAsset'

export const TradeTokensBanner = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const navigationTo = useNavigateTo()

  const handleSwap = () => {
    navigationTo.swap()
  }

  return (
    <View style={styles.root}>
      <LinearGradient style={styles.gradientRoot} colors={colors.gradientColor} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
        <Text style={styles.title}>{strings.tradeTokens}</Text>

        <Button
          mainTheme
          title={strings.swap.toLocaleUpperCase()}
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
      width: 164,
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
      backgroundColor: color.gray_cmin,
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
      color: color.gray_cmax,
    },
    assetBox: {
      ...atoms.absolute,
      ...atoms.flex_col,
      ...atoms.justify_center,
      ...atoms.align_center,
      right: -17.09,
      top: 37.61,
    },
  })

  const colors = {
    gradientColor: color.bg_gradient_1,
  }

  return {styles, colors} as const
}
