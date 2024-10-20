import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button} from '../../../../components/Button/Button'
import {Space} from '../../../../components/Space/Space'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {useStrings} from '../useStrings'
import {PreprodFaucetBannerLogo} from './PreprodFaucetBannerLogo'

export const PreprodFaucetBanner = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()

  const handleOnPress = () => {
    Linking.openURL('https://docs.cardano.org/cardano-testnets/tools/faucet/')
  }

  return (
    <LinearGradient style={styles.gradient} start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={colors.gradientColor}>
      <View style={styles.viewTitle}>
        <Text style={styles.title}>{strings.preprodFaucetBannerTitle}</Text>

        <Space height="xs" />
      </View>

      <View style={styles.content}>
        <View style={styles.contentInner}>
          <Spacer height={8} />

          <Text style={styles.text}>{strings.preprodFaucetBannerText}</Text>

          <Space height="lg" />

          <Button
            testID="rampOnOffButton"
            title={strings.preprodFaucetBannerButtonText}
            onPress={handleOnPress}
            style={styles.spaceButton}
          />
        </View>

        <View style={styles.logo}>
          <PreprodFaucetBannerLogo />
        </View>
      </View>
    </LinearGradient>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    gradient: {
      ...atoms.flex_1,
      opacity: 1,
      borderRadius: 8,
      ...atoms.flex_col,
    },
    viewTitle: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.pt_md,
    },
    title: {
      ...atoms.body_1_lg_medium,
      color: color.gray_max,
      ...atoms.flex_wrap,
      ...atoms.flex_shrink,
    },
    content: {
      position: 'relative',
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.pb_lg,
    },
    contentInner: {
      ...atoms.flex_1,
    },
    logo: {
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.gray_max,
      maxWidth: 270,
    },
    spaceButton: {
      maxWidth: 180,
    },
  })
  const colors = {
    gradientColor: color.bg_gradient_1,
    gray: color.gray_max,
  }
  return {styles, colors} as const
}
