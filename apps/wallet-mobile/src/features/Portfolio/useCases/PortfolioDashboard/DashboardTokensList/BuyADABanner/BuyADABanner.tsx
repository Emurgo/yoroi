import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button, Spacer} from '../../../../../../components'
import {useNavigateTo} from '../../../../common/useNavigateTo'
import {useStrings} from '../../../../common/useStrings'
import {AssetImage} from './AssetImage'

export const BuyADABanner = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const navigationTo = useNavigateTo()

  const handleExchange = () => {
    navigationTo.buyAda()
  }

  return (
    <View>
      <LinearGradient style={styles.gradientRoot} colors={colors.gradientColor}>
        <Text style={styles.title}>{strings.buyADATitle}</Text>

        <Spacer height={4} />

        <Text style={styles.description}>{strings.buyADADescription}</Text>

        <Spacer height={16} />

        <Button
          mainTheme
          title={strings.buyCrypto.toLocaleUpperCase()}
          onPress={handleExchange}
          style={styles.spaceButton}
          textStyles={styles.spaceButtonText}
        />

        <View style={styles.assetImageBox}>
          <AssetImage />
        </View>
      </LinearGradient>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    gradientRoot: {
      ...atoms.p_lg,
      ...atoms.flex_col,
      ...atoms.align_start,
      ...atoms.relative,
      ...atoms.rounded_sm,
      ...atoms.overflow_hidden,
      backgroundColor: color.bg_color_high,
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
    description: {
      ...atoms.body_2_md_regular,
      color: color.gray_cmax,
      maxWidth: 220,
    },
    assetImageBox: {
      ...atoms.absolute,
      top: 57,
      right: -4.57,
    },
  })

  const colors = {
    gradientColor: color.bg_gradient_2,
  }

  return {styles, colors} as const
}
