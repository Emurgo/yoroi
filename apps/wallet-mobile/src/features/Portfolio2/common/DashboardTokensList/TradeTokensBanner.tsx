import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {TxHistoryRouteNavigation} from 'src/navigation'

import {Button} from '../../../../components'
import {useStrings} from '../useStrings'
import {TradeTokensAsset} from './TradeTokensAsset'

export const TradeTokensBanner = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const handleSwap = () => {
    navigation.navigate('swap-start-swap')
  }

  return (
    <View style={styles.root}>
      <LinearGradient style={styles.gradientRoot} colors={colors.gradientColor}>
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
    },
    assetBox: {
      ...atoms.absolute,
      ...atoms.flex_col,
      ...atoms.justify_center,
      ...atoms.align_center,
      right: 0,
      top: 0,
      bottom: 0,
    },
  })

  const colors = {
    gradientColor: color.bg_gradient_2,
  }

  return {styles, colors} as const
}
